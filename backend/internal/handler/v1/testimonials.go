package v1

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
)

// ListTestimonials — public, active only, ordered.
func ListTestimonials(c *gin.Context) {
	var testimonials []models.Testimonial
	if err := db.DB.Where("active = ?", true).Order("sort_order asc, id asc").Find(&testimonials).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, testimonials)
}

func AdminListTestimonials(c *gin.Context) {
	var testimonials []models.Testimonial
	if err := db.DB.Order("sort_order asc, id asc").Find(&testimonials).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, testimonials)
}

func AdminCreateTestimonial(c *gin.Context) {
	var t models.Testimonial
	if err := c.ShouldBindJSON(&t); err != nil {
		badRequest(c, err.Error())
		return
	}
	t.ID = 0
	if err := db.DB.Create(&t).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(201, t)
}

func AdminUpdateTestimonial(c *gin.Context) {
	id := c.Param("id")
	var t models.Testimonial
	if err := db.DB.First(&t, id).Error; err != nil {
		notFound(c)
		return
	}
	var input models.Testimonial
	if err := c.ShouldBindJSON(&input); err != nil {
		badRequest(c, err.Error())
		return
	}
	input.ID = t.ID
	input.CreatedAt = t.CreatedAt
	if err := db.DB.Save(&input).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, input)
}

func AdminDeleteTestimonial(c *gin.Context) {
	if err := db.DB.Delete(&models.Testimonial{}, c.Param("id")).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(204)
}
