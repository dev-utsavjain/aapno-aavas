package v1

import (
	"errors"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"imagine_backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPage — public, by slug.
func GetPage(c *gin.Context) {
	var page models.Page
	err := db.DB.Where("slug = ?", c.Param("slug")).First(&page).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		notFound(c)
		return
	}
	if err != nil {
		serverError(c, err)
		return
	}
	ok(c, page)
}

func AdminListPages(c *gin.Context) {
	var pages []models.Page
	if err := db.DB.Order("slug asc").Find(&pages).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, pages)
}

func AdminCreatePage(c *gin.Context) {
	var page models.Page
	if err := c.ShouldBindJSON(&page); err != nil {
		badRequest(c, err.Error())
		return
	}
	page.ID = 0
	page.Body = services.SanitizeHTML(page.Body) // strip stored-XSS before persist
	if err := db.DB.Create(&page).Error; err != nil {
		badRequest(c, "could not create page (duplicate slug?): "+err.Error())
		return
	}
	c.JSON(201, page)
}

func AdminUpdatePage(c *gin.Context) {
	id := c.Param("id")
	var page models.Page
	if err := db.DB.First(&page, id).Error; err != nil {
		notFound(c)
		return
	}
	var input models.Page
	if err := c.ShouldBindJSON(&input); err != nil {
		badRequest(c, err.Error())
		return
	}
	input.ID = page.ID
	input.CreatedAt = page.CreatedAt
	input.Body = services.SanitizeHTML(input.Body)
	if err := db.DB.Save(&input).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, input)
}

func AdminDeletePage(c *gin.Context) {
	if err := db.DB.Delete(&models.Page{}, c.Param("id")).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(204)
}
