// Package web serves the embedded React SPA with per-route SEO meta injected server-side, so
// crawlers and social scrapers (which don't run JS) get correct <title>/description/OG tags —
// including for projects created via admin after the build. No Node SSR involved.
package web

import (
	"errors"
	"fmt"
	"html"
	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	baseHTML string
	titleRe  = regexp.MustCompile(`(?s)<title>.*?</title>`)
)

const (
	defaultTitle = "Aapno Aavas — Premium Residential & Commercial Properties in Jaipur"
	defaultDesc  = "Aapno Aavas is a trusted Jaipur real-estate advisory & channel partner. Explore RERA-registered residential and commercial projects and connect with our advisors."
)

// Init loads the embedded index.html once at startup.
func Init(indexHTML string) {
	baseHTML = indexHTML
	if baseHTML == "" {
		baseHTML = "<!doctype html><html><head><title></title></head><body><div id=\"root\"></div></body></html>"
	}
}

type meta struct {
	Title       string
	Description string
	Path        string // e.g. /projects/foo
	Image       string // absolute URL
	ImageAlt    string
	Type        string // website | article
	Robots      string // e.g. noindex
}

func (m meta) canonical() string {
	base := config.AppConfig.SiteURL
	if base == "" {
		return ""
	}
	return base + m.Path
}

func attr(s string) string { return html.EscapeString(strings.TrimSpace(s)) }

func render(m meta) string {
	if m.Title == "" {
		m.Title = defaultTitle
	}
	if m.Description == "" {
		m.Description = defaultDesc
	}
	if m.Type == "" {
		m.Type = "website"
	}
	out := titleRe.ReplaceAllString(baseHTML, "<title>"+attr(m.Title)+"</title>")

	var b strings.Builder
	fmt.Fprintf(&b, `<meta name="description" content="%s">`, attr(m.Description))
	if c := m.canonical(); c != "" {
		fmt.Fprintf(&b, `<link rel="canonical" href="%s">`, attr(c))
		fmt.Fprintf(&b, `<meta property="og:url" content="%s">`, attr(c))
	}
	if m.Robots != "" {
		fmt.Fprintf(&b, `<meta name="robots" content="%s">`, attr(m.Robots))
	}
	fmt.Fprintf(&b, `<meta property="og:title" content="%s">`, attr(m.Title))
	fmt.Fprintf(&b, `<meta property="og:description" content="%s">`, attr(m.Description))
	fmt.Fprintf(&b, `<meta property="og:type" content="%s">`, attr(m.Type))
	fmt.Fprintf(&b, `<meta property="og:site_name" content="Aapno Aavas">`)
	if m.Image != "" {
		fmt.Fprintf(&b, `<meta property="og:image" content="%s">`, attr(m.Image))
		fmt.Fprintf(&b, `<meta property="og:image:alt" content="%s">`, attr(m.ImageAlt))
		fmt.Fprintf(&b, `<meta name="twitter:card" content="summary_large_image">`)
		fmt.Fprintf(&b, `<meta name="twitter:image" content="%s">`, attr(m.Image))
	} else {
		fmt.Fprintf(&b, `<meta name="twitter:card" content="summary">`)
	}
	fmt.Fprintf(&b, `<meta name="twitter:title" content="%s">`, attr(m.Title))
	fmt.Fprintf(&b, `<meta name="twitter:description" content="%s">`, attr(m.Description))

	return strings.Replace(out, "</head>", b.String()+"</head>", 1)
}

func writeHTML(c *gin.Context, status int, htmlStr string) {
	// Templated HTML must not be cached across projects — no ETag/modtime games.
	c.Header("Cache-Control", "no-cache")
	c.Data(status, "text/html; charset=utf-8", []byte(htmlStr))
}

// absURL makes a media URL absolute for og:image (scrapers reject relative paths).
func absURL(u string) string {
	if u == "" {
		return ""
	}
	if strings.HasPrefix(u, "http://") || strings.HasPrefix(u, "https://") {
		return u
	}
	return config.AppConfig.SiteURL + u
}

// ---- Route handlers ----

func Home(c *gin.Context) {
	writeHTML(c, http.StatusOK, render(meta{Path: "/"}))
}

func Listings(c *gin.Context) {
	writeHTML(c, http.StatusOK, render(meta{
		Title:       "Property Listings in Jaipur | Aapno Aavas",
		Description: "Browse residential and commercial projects across Jaipur. Filter by locality, configuration, budget and status.",
		Path:        "/projects",
	}))
}

func Project(c *gin.Context) {
	slug := c.Param("slug")
	var p models.Project
	err := db.DB.Preload("Media", func(d *gorm.DB) *gorm.DB { return d.Order("sort_order asc").Limit(1) }).
		Where("slug = ? AND is_published = ?", slug, true).First(&p).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Real 404 + noindex, not a 200 shell that gets soft-404 indexed.
		writeHTML(c, http.StatusNotFound, render(meta{
			Title: "Project not found | Aapno Aavas", Path: "/projects/" + slug, Robots: "noindex",
		}))
		return
	}
	if err != nil {
		writeHTML(c, http.StatusOK, render(meta{Path: "/projects/" + slug}))
		return
	}

	title := p.MetaTitle
	if title == "" {
		title = fmt.Sprintf("%s%s | Aapno Aavas", p.Title, localitySuffix(p))
	}
	desc := p.MetaDescription
	if desc == "" {
		desc = truncate(p.Description, 300)
	}
	img := ""
	if len(p.Media) > 0 {
		img = absURL(p.Media[0].URL)
	}
	writeHTML(c, http.StatusOK, render(meta{
		Title: title, Description: desc, Path: "/projects/" + p.Slug,
		Image: img, ImageAlt: p.Title, Type: "article",
	}))
}

// StaticPage returns a handler that serves the SPA shell with fixed meta (for routes not
// backed by the pages table, e.g. /contact).
func StaticPage(title, desc string) gin.HandlerFunc {
	return func(c *gin.Context) {
		writeHTML(c, http.StatusOK, render(meta{Title: title, Description: desc, Path: c.Request.URL.Path}))
	}
}

// Page serves a known static/CMS page path with meta from the pages table when present.
func Page(c *gin.Context, slug string) {
	var pg models.Page
	m := meta{Path: c.Request.URL.Path}
	if err := db.DB.Where("slug = ?", slug).First(&pg).Error; err == nil {
		m.Title = firstNonEmpty(pg.MetaTitle, pg.Title+" | Aapno Aavas")
		m.Description = pg.MetaDescription
	}
	writeHTML(c, http.StatusOK, render(m))
}

// Shell is the generic SPA fallback (NoRoute) for client-only routes. Admin is noindex.
func Shell(c *gin.Context) {
	m := meta{Path: c.Request.URL.Path}
	if strings.HasPrefix(c.Request.URL.Path, "/admin") {
		m.Robots = "noindex, nofollow"
		m.Title = "Admin | Aapno Aavas"
	}
	writeHTML(c, http.StatusOK, render(m))
}

func localitySuffix(p models.Project) string {
	if p.Locality != "" {
		return " in " + p.Locality
	}
	if p.City != "" {
		return " in " + p.City
	}
	return ""
}

func truncate(s string, n int) string {
	s = strings.TrimSpace(s)
	if len(s) <= n {
		return s
	}
	return strings.TrimSpace(s[:n]) + "…"
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}
