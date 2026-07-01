package v1

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// pagination parsed from ?page=&limit= with a clamped, sane default/max.
type pageParams struct {
	Page   int
	Limit  int
	Offset int
}

func parsePage(c *gin.Context) pageParams {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	if limit < 1 {
		limit = 12
	}
	if limit > 48 {
		limit = 48
	}
	return pageParams{Page: page, Limit: limit, Offset: (page - 1) * limit}
}

// listResponse is the standard shape for paginated list endpoints.
type listResponse struct {
	Data  any   `json:"data"`
	Total int64 `json:"total"`
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
}

func ok(c *gin.Context, data any) {
	c.JSON(200, data)
}

func badRequest(c *gin.Context, msg string) {
	c.JSON(400, gin.H{"error": msg})
}

func notFound(c *gin.Context) {
	c.JSON(404, gin.H{"error": "not found"})
}

func serverError(c *gin.Context, err error) {
	c.JSON(500, gin.H{"error": "internal server error", "detail": err.Error()})
}
