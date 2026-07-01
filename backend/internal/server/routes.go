package server

import (
	"imagine_backend/internal/handler"
	v1 "imagine_backend/internal/handler/v1"
	"imagine_backend/internal/handler/web"
	"imagine_backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	// Health (Railway healthcheck hits /api/health).
	api := r.Group("/api")
	api.GET("/health", handler.HealthCheck)

	// Public SEO/HTML routes — server-rendered meta into the embedded SPA. Registered
	// explicitly so they take precedence over the NoRoute SPA fallback.
	r.GET("/", web.Home)
	r.GET("/projects", web.Listings)
	r.GET("/projects/:slug", web.Project)
	r.GET("/about", func(c *gin.Context) { web.Page(c, "about") })
	r.GET("/privacy", func(c *gin.Context) { web.Page(c, "privacy") })
	r.GET("/terms", func(c *gin.Context) { web.Page(c, "terms") })
	r.GET("/contact", web.StaticPage("Contact Aapno Aavas | Talk to a Property Advisor",
		"Get in touch with Aapno Aavas advisors for residential and commercial property in Jaipur."))
	r.GET("/sitemap.xml", web.Sitemap)
	r.GET("/robots.txt", web.Robots)

	// JSON API.
	apiV1 := r.Group("/api/v1")
	{
		// Public
		apiV1.GET("/projects", v1.ListProjects)
		apiV1.GET("/projects/:slug", v1.GetProject)
		apiV1.GET("/banners", v1.ListBanners)
		apiV1.GET("/pages/:slug", v1.GetPage)
		apiV1.POST("/leads", middleware.StrictRateLimiter(), v1.CreateLead)

		// Admin auth
		apiV1.POST("/admin/login", middleware.StrictRateLimiter(), v1.AdminLogin)

		// Admin (JWT-protected)
		admin := apiV1.Group("/admin")
		admin.Use(middleware.AuthMiddleware())
		{
			admin.GET("/projects", v1.AdminListProjects)
			admin.POST("/projects", v1.AdminCreateProject)
			admin.GET("/projects/:id", v1.AdminGetProject)
			admin.PUT("/projects/:id", v1.AdminUpdateProject)
			admin.DELETE("/projects/:id", v1.AdminDeleteProject)

			admin.GET("/leads", v1.AdminListLeads)
			admin.PATCH("/leads/:id", v1.AdminUpdateLead)
			admin.GET("/leads/export.csv", v1.ExportLeadsCSV)

			admin.GET("/banners", v1.AdminListBanners)
			admin.POST("/banners", v1.AdminCreateBanner)
			admin.PUT("/banners/:id", v1.AdminUpdateBanner)
			admin.DELETE("/banners/:id", v1.AdminDeleteBanner)

			admin.GET("/pages", v1.AdminListPages)
			admin.POST("/pages", v1.AdminCreatePage)
			admin.PUT("/pages/:id", v1.AdminUpdatePage)
			admin.DELETE("/pages/:id", v1.AdminDeletePage)

			admin.POST("/media/upload", v1.AdminUploadMedia)
			admin.POST("/media", v1.AdminCreateMediaByURL)
			admin.DELETE("/media/:id", v1.AdminDeleteMedia)
		}
	}
}
