package v1

import (
	"errors"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// applyProjectFilters builds the WHERE clause shared by the public listing endpoint.
func applyProjectFilters(q *gorm.DB, c *gin.Context) *gorm.DB {
	if city := c.Query("city"); city != "" {
		q = q.Where("city ILIKE ?", city)
	}
	if t := c.Query("type"); t != "" {
		q = q.Where("type = ?", t)
	}
	if bhk := c.Query("bhk"); bhk != "" {
		q = q.Where("bhk_config ILIKE ?", "%"+bhk+"%")
	}
	if status := c.Query("status"); status != "" {
		q = q.Where("status = ?", status)
	}
	if tag := c.Query("tag"); tag != "" {
		// jsonb containment, backed by the GIN index
		q = q.Where("tags @> ?", `["`+strings.ReplaceAll(tag, `"`, "")+`"]`)
	}
	if minStr := c.Query("price_min"); minStr != "" {
		if v, err := strconv.ParseInt(minStr, 10, 64); err == nil {
			q = q.Where("price_max = 0 OR price_max >= ?", v)
		}
	}
	if maxStr := c.Query("price_max"); maxStr != "" {
		if v, err := strconv.ParseInt(maxStr, 10, 64); err == nil {
			q = q.Where("price_min <= ?", v)
		}
	}
	if search := c.Query("q"); search != "" {
		like := "%" + search + "%"
		q = q.Where("title ILIKE ? OR locality ILIKE ? OR developer_name ILIKE ?", like, like, like)
	}
	return q
}

// ListProjects — public, published only, filtered + paginated + deterministically ordered.
func ListProjects(c *gin.Context) {
	p := parsePage(c)

	base := applyProjectFilters(db.DB.Model(&models.Project{}).Where("is_published = ?", true), c)

	var total int64
	if err := base.Count(&total).Error; err != nil {
		serverError(c, err)
		return
	}

	var projects []models.Project
	if err := base.
		Preload("Media", func(d *gorm.DB) *gorm.DB { return d.Order("sort_order asc").Limit(1) }).
		Order("featured DESC, created_at DESC, id DESC").
		Limit(p.Limit).Offset(p.Offset).
		Find(&projects).Error; err != nil {
		serverError(c, err)
		return
	}

	ok(c, listResponse{Data: projects, Total: total, Page: p.Page, Limit: p.Limit})
}

// GetProject — public, by slug, published only, with full media gallery.
func GetProject(c *gin.Context) {
	slug := c.Param("slug")
	var project models.Project
	err := db.DB.
		Preload("Media", func(d *gorm.DB) *gorm.DB { return d.Order("sort_order asc, id asc") }).
		Where("slug = ? AND is_published = ?", slug, true).
		First(&project).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		notFound(c)
		return
	}
	if err != nil {
		serverError(c, err)
		return
	}
	ok(c, project)
}

// ---- Admin ----

// AdminListProjects — includes unpublished, no filters stripped, paginated.
func AdminListProjects(c *gin.Context) {
	p := parsePage(c)
	base := applyProjectFilters(db.DB.Model(&models.Project{}), c)

	var total int64
	base.Count(&total)

	var projects []models.Project
	if err := base.
		Preload("Media", func(d *gorm.DB) *gorm.DB { return d.Order("sort_order asc").Limit(1) }).
		Order("created_at DESC, id DESC").
		Limit(p.Limit).Offset(p.Offset).
		Find(&projects).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, listResponse{Data: projects, Total: total, Page: p.Page, Limit: p.Limit})
}

func AdminGetProject(c *gin.Context) {
	id := c.Param("id")
	var project models.Project
	err := db.DB.Preload("Media", func(d *gorm.DB) *gorm.DB { return d.Order("sort_order asc, id asc") }).
		First(&project, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		notFound(c)
		return
	}
	if err != nil {
		serverError(c, err)
		return
	}
	ok(c, project)
}

func AdminCreateProject(c *gin.Context) {
	var project models.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		badRequest(c, err.Error())
		return
	}
	project.ID = 0
	project.Slug = slugify(project.Slug, project.Title)
	if err := db.DB.Create(&project).Error; err != nil {
		badRequest(c, "could not create project (duplicate slug?): "+err.Error())
		return
	}
	c.JSON(201, project)
}

func AdminUpdateProject(c *gin.Context) {
	id := c.Param("id")
	var project models.Project
	if err := db.DB.First(&project, id).Error; err != nil {
		notFound(c)
		return
	}
	var input models.Project
	if err := c.ShouldBindJSON(&input); err != nil {
		badRequest(c, err.Error())
		return
	}
	input.ID = project.ID
	input.CreatedAt = project.CreatedAt
	input.Slug = slugify(input.Slug, input.Title)
	// Save full row (Media managed via its own endpoint).
	if err := db.DB.Model(&project).Omit("Media").Save(&input).Error; err != nil {
		badRequest(c, err.Error())
		return
	}
	ok(c, input)
}

func AdminDeleteProject(c *gin.Context) {
	id := c.Param("id")
	if err := db.DB.Delete(&models.Project{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(204)
}

// slugify prefers an explicit slug, else derives from the title. Lowercase, hyphenated.
func slugify(explicit, title string) string {
	s := explicit
	if s == "" {
		s = title
	}
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	prevDash := false
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			prevDash = false
		case r == ' ' || r == '-' || r == '_':
			if !prevDash {
				b.WriteRune('-')
				prevDash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}
