package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware allows all origins. The imagine preview and the Railway backend are on
// different hosts, so every browser call is cross-origin. Auth is Bearer-token (not
// cookies), so wildcard is correct and safe — never pair `*` with Allow-Credentials.
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
