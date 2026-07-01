package middleware

import (
	"imagine_backend/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware echoes back only origins present in ALLOWED_ORIGINS. In production the SPA
// is served same-origin from this service, so CORS is largely a no-op; the allowlist exists
// for local dev (Vite on :5173) and any future split-origin deploy. No wildcard.
func CORSMiddleware() gin.HandlerFunc {
	allowed := make(map[string]bool, len(config.AppConfig.AllowedOrigins))
	for _, o := range config.AppConfig.AllowedOrigins {
		allowed[o] = true
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin != "" && allowed[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
