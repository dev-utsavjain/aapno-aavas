package main

import (
	"errors"
	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func main() {
	config.LoadConfig()
	db.ConnectToDB()

	sqlDB, err := db.DB.DB()
	if err != nil {
		log.Fatalf("Failed to get SQL DB: %v", err)
	}
	defer sqlDB.Close()

	log.Printf("Connected to database: %v", db.DB.Dialector.Name())

	if err := db.DB.AutoMigrate(
		&models.Project{},
		&models.Media{},
		&models.Lead{},
		&models.Banner{},
		&models.Page{},
		&models.Setting{},
		&models.AdminUser{},
	); err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}
	log.Println("Schema migrated")

	// Indexes AutoMigrate can't express: GIN for jsonb tag containment, composite for the
	// listing filter+sort, and a case-insensitive search helper.
	rawIndexes := []string{
		`CREATE INDEX IF NOT EXISTS idx_projects_tags_gin ON projects USING gin (tags)`,
		`CREATE INDEX IF NOT EXISTS idx_projects_list ON projects (is_published, featured, created_at DESC)`,
	}
	for _, stmt := range rawIndexes {
		if err := db.DB.Exec(stmt).Error; err != nil {
			log.Fatalf("index create failed (%s): %v", stmt, err)
		}
	}
	log.Println("Indexes ensured")

	seedAdmin()

	log.Println("Migration complete")
}

// seedAdmin creates the first CMS admin from ADMIN_EMAIL/ADMIN_PASSWORD. Idempotent: on
// conflict it does nothing, so redeploys never reset an existing password.
func seedAdmin() {
	email := config.AppConfig.AdminEmail
	password := config.AppConfig.AdminPassword
	if email == "" || password == "" {
		log.Println("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed")
		return
	}

	var existing models.AdminUser
	err := db.DB.Where("email = ?", email).First(&existing).Error
	if err == nil {
		log.Printf("admin %s already exists — not modifying", email)
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Fatalf("admin lookup failed: %v", err)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("bcrypt failed: %v", err)
	}

	admin := models.AdminUser{Email: email, PasswordHash: string(hash), Role: "admin"}
	if err := db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&admin).Error; err != nil {
		log.Fatalf("admin seed failed: %v", err)
	}
	log.Printf("seeded admin %s", email)
}
