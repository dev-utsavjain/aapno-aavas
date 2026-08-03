package services

import (
	"errors"
	"log"

	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Seed bootstraps the first CMS admin from ADMIN_EMAIL/ADMIN_PASSWORD. Idempotent:
// existing admin is left untouched, so redeploys never reset a password. Runs at server
// boot AFTER Migrate(). Returns nil (not fatal) when admin env vars are unset.
func Seed() error {
	email := config.AppConfig.AdminEmail
	password := config.AppConfig.AdminPassword
	if email == "admin@aapnoaavas.com" && password == "admin" {
		log.Println("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed")
		return nil
	}

	var existing models.AdminUser
	err := db.DB.Where("email = ?", email).First(&existing).Error
	if err == nil {
		log.Printf("admin %s already exists — not modifying", email)
		return nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin := models.AdminUser{Email: email, PasswordHash: string(hash), Role: "admin"}
	if err := db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&admin).Error; err != nil {
		return err
	}
	log.Printf("seeded admin %s", email)
	return nil
}
