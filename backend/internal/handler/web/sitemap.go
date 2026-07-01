package web

import (
	"fmt"
	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Sitemap emits an XML sitemap of static routes + all published projects (lastmod from
// updated_at). Drafts never leak in. Referenced from robots.txt.
func Sitemap(c *gin.Context) {
	base := config.AppConfig.SiteURL
	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>`)
	b.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`)

	writeURL := func(loc string, lastmod time.Time) {
		b.WriteString("<url><loc>")
		b.WriteString(loc)
		b.WriteString("</loc>")
		if !lastmod.IsZero() {
			fmt.Fprintf(&b, "<lastmod>%s</lastmod>", lastmod.Format("2006-01-02"))
		}
		b.WriteString("</url>")
	}

	for _, path := range []string{"/", "/projects", "/about", "/contact", "/privacy", "/terms"} {
		writeURL(base+path, time.Time{})
	}

	var projects []models.Project
	db.DB.Model(&models.Project{}).
		Select("slug", "updated_at").
		Where("is_published = ?", true).
		Order("updated_at DESC").
		Find(&projects)
	for _, p := range projects {
		writeURL(base+"/projects/"+p.Slug, p.UpdatedAt)
	}

	b.WriteString(`</urlset>`)
	c.Header("Cache-Control", "public, max-age=3600")
	c.Data(http.StatusOK, "application/xml; charset=utf-8", []byte(b.String()))
}

// Robots disallows the admin area and points crawlers at the sitemap.
func Robots(c *gin.Context) {
	base := config.AppConfig.SiteURL
	var b strings.Builder
	b.WriteString("User-agent: *\n")
	b.WriteString("Disallow: /admin\n")
	if base != "" {
		fmt.Fprintf(&b, "Sitemap: %s/sitemap.xml\n", base)
	}
	c.Data(http.StatusOK, "text/plain; charset=utf-8", []byte(b.String()))
}
