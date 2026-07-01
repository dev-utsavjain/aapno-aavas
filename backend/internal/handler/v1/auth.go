package v1

import (
	"errors"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"imagine_backend/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AdminLogin verifies credentials against admin_users and issues a JWT. Uses a constant-ish
// path (always runs bcrypt) and a generic error to avoid user enumeration.
func AdminLogin(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, "email and password are required")
		return
	}

	var admin models.AdminUser
	err := db.DB.Where("email = ?", req.Email).First(&admin).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Run a dummy compare to keep timing similar, then reject.
		_ = bcrypt.CompareHashAndPassword([]byte("$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv"), []byte(req.Password))
		c.JSON(401, gin.H{"error": "invalid credentials"})
		return
	}
	if err != nil {
		serverError(c, err)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)) != nil {
		c.JSON(401, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := utils.GenerateJWT(admin.ID, admin.Email)
	if err != nil {
		serverError(c, err)
		return
	}

	ok(c, gin.H{
		"token": token,
		"admin": gin.H{"id": admin.ID, "email": admin.Email, "role": admin.Role},
	})
}
