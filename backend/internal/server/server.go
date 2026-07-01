package server

import (
	"context"
	"errors"
	"imagine_backend/config"
	webserver "imagine_backend/internal"
	"imagine_backend/internal/db"
	"imagine_backend/internal/handler/web"
	"imagine_backend/internal/middleware"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func StartServer() {
	config.LoadConfig()
	db.ConnectToDB()

	// Load the embedded index.html once so the web package can inject per-route meta into it.
	web.Init(readEmbeddedIndex())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	server := createServer()

	if err := runServer(ctx, server, 5*time.Second); err != nil {
		log.Fatal(err)
	}
}

func createServer() *http.Server {
	if config.AppConfig.IsProd() {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()

	// Trust only private/internal proxy hops (Railway fronts the app over its private network),
	// so X-Forwarded-For can't be spoofed by public clients past the edge.
	// ponytail: Railway has no published stable proxy CIDR — Turnstile + honeypot are the real
	// spam defense; this just keeps per-IP rate-limit identity honest to the last trusted hop.
	if err := r.SetTrustedProxies([]string{"100.64.0.0/10", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"}); err != nil {
		log.Printf("SetTrustedProxies: %v", err)
	}

	r.Use(middleware.CORSMiddleware())

	r.OPTIONS("/*path", func(c *gin.Context) {
		c.AbortWithStatus(http.StatusNoContent)
	})

	r.Use(
		gin.Logger(),
		gin.Recovery(),
		middleware.IPLoggingMiddleware(),
		middleware.ErrorHandlingMiddleware(),
		middleware.RateLimiterMiddleware(),
	)

	// Hashed static assets — long-lived immutable cache.
	assetsFS := getFileSystem(false)
	r.GET("/assets/*filepath", func(c *gin.Context) {
		file := strings.TrimPrefix(c.Param("filepath"), "/")
		f, err := assetsFS.Open("assets/" + file)
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		defer f.Close()
		stat, _ := f.Stat()
		c.Header("Cache-Control", "public, max-age=31536000, immutable")
		http.ServeContent(c.Writer, c.Request, file, stat.ModTime(), f)
	})

	// Fallback: API 404s stay JSON; otherwise try to serve an embedded static file from the
	// build root (favicon, /logo.png, /img/*, /gallery/*, /fonts/*), else the SPA shell.
	r.NoRoute(func(c *gin.Context) {
		p := c.Request.URL.Path
		if strings.HasPrefix(p, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API not found"})
			return
		}
		if serveEmbeddedFile(c, assetsFS, p) {
			return
		}
		web.Shell(c)
	})

	RegisterRoutes(r)

	return &http.Server{
		Addr:    ":" + config.AppConfig.Port,
		Handler: r,
	}
}

// serveEmbeddedFile serves a static file from the embedded build root (e.g. /logo.png,
// /img/hero.jpg, /fonts/*.woff2). Returns false when the path isn't a real file, so the
// caller can fall back to the SPA shell. index.html is never served here (goes through Shell).
func serveEmbeddedFile(c *gin.Context, fsys http.FileSystem, urlPath string) bool {
	name := strings.TrimPrefix(path.Clean(urlPath), "/")
	if name == "" || name == "index.html" {
		return false
	}
	f, err := fsys.Open(name)
	if err != nil {
		return false
	}
	defer f.Close()
	stat, err := f.Stat()
	if err != nil || stat.IsDir() {
		return false
	}
	// public/ assets (non-hashed) — modest cache. Hashed /assets/* are handled separately.
	c.Header("Cache-Control", "public, max-age=86400")
	http.ServeContent(c.Writer, c.Request, name, stat.ModTime(), f)
	return true
}

func readEmbeddedIndex() string {
	fsys, err := fs.Sub(webserver.DistFolder, "dist")
	if err != nil {
		log.Printf("embed sub failed: %v", err)
		return ""
	}
	f, err := fsys.Open("index.html")
	if err != nil {
		log.Printf("embedded index.html not found (frontend not built?): %v", err)
		return ""
	}
	defer f.Close()
	b, err := io.ReadAll(f)
	if err != nil {
		return ""
	}
	return string(b)
}

func runServer(
	ctx context.Context,
	server *http.Server,
	shutdownTimeOut time.Duration,
) error {
	errCh := make(chan error, 1)
	go func() {
		log.Println("Server running on :" + config.AppConfig.Port)
		if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-errCh:
		return err
	case <-stop:
		log.Printf("Received shutdown signal")
	case <-ctx.Done():
		log.Printf("Context canceled, shutting down")
	}

	shutDownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeOut)
	defer cancel()

	if err := server.Shutdown(shutDownCtx); err != nil {
		if closeErr := server.Close(); closeErr != nil {
			return errors.Join(err, closeErr)
		}
		return err
	}

	log.Println("Server stopped gracefully")
	return nil
}

func getFileSystem(useOS bool) http.FileSystem {
	if useOS {
		return http.FS(os.DirFS("dist"))
	}
	fsys, err := fs.Sub(webserver.DistFolder, "dist")
	if err != nil {
		panic(err)
	}
	return http.FS(fsys)
}
