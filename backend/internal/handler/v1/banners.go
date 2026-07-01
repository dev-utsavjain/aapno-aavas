package v1

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
)

// ListBanners — public, active only, ordered.
func ListBanners(c *gin.Context) {
	var banners []models.Banner
	q := db.DB.Where("active = ?", true)
	if placement := c.Query("placement"); placement != "" {
		q = q.Where("placement = ?", placement)
	}
	if err := q.Order("sort_order asc, id asc").Find(&banners).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, banners)
}

func AdminListBanners(c *gin.Context) {
	var banners []models.Banner
	if err := db.DB.Order("sort_order asc, id asc").Find(&banners).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, banners)
}

func AdminCreateBanner(c *gin.Context) {
	var b models.Banner
	if err := c.ShouldBindJSON(&b); err != nil {
		badRequest(c, err.Error())
		return
	}
	b.ID = 0
	if err := db.DB.Create(&b).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(201, b)
}

func AdminUpdateBanner(c *gin.Context) {
	id := c.Param("id")
	var b models.Banner
	if err := db.DB.First(&b, id).Error; err != nil {
		notFound(c)
		return
	}
	var input models.Banner
	if err := c.ShouldBindJSON(&input); err != nil {
		badRequest(c, err.Error())
		return
	}
	input.ID = b.ID
	input.CreatedAt = b.CreatedAt
	if err := db.DB.Save(&input).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, input)
}

func AdminDeleteBanner(c *gin.Context) {
	if err := db.DB.Delete(&models.Banner{}, c.Param("id")).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(204)
}
