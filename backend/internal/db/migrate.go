package db

import (
	"fmt"

	"imagine_backend/config"
	"imagine_backend/internal/models"
)

// Migrate creates the tenant schema, pins search_path, and AutoMigrates every model.
// Idempotent — safe to run on every server boot AND from cmd/migration. This is the
// ONLY place the migrated model list lives.
func Migrate() error {
	schema := config.AppConfig.DBSchema // ← DB_SCHEMA env var
	if schema == "" {
		return fmt.Errorf("DB_SCHEMA is required but empty — cannot migrate without a target schema")
	}
	if err := DB.Exec(fmt.Sprintf(`CREATE SCHEMA IF NOT EXISTS "%s"`, schema)).Error; err != nil {
		return fmt.Errorf("create schema %q: %w", schema, err)
	}
	if err := DB.Exec(fmt.Sprintf(`SET search_path TO "%s"`, schema)).Error; err != nil {
		return fmt.Errorf("set search_path %q: %w", schema, err)
	}

	if err := DB.AutoMigrate(
		&models.Project{},
		&models.Media{},
		&models.Lead{},
		&models.Banner{},
		&models.Testimonial{},
		&models.Page{},
		&models.Setting{},
		&models.AdminUser{},
	); err != nil {
		return fmt.Errorf("automigrate: %w", err)
	}

	// Backfill Category on pre-existing projects (added after launch). Idempotent — only
	// touches rows without a category. Commercial maps 1:1; residential defaults to flat.
	DB.Model(&models.Project{}).Where("category = '' AND type = 'commercial'").Update("category", "commercial")
	DB.Model(&models.Project{}).Where("category = '' AND type = 'residential'").Update("category", "flat")

	// Indexes AutoMigrate can't express: GIN for jsonb tag containment and the composite
	// listing filter+sort. Both idempotent (IF NOT EXISTS).
	for _, stmt := range []string{
		`CREATE INDEX IF NOT EXISTS idx_projects_tags_gin ON projects USING gin (tags)`,
		`CREATE INDEX IF NOT EXISTS idx_projects_list ON projects (is_published, featured, created_at DESC)`,
	} {
		if err := DB.Exec(stmt).Error; err != nil {
			return fmt.Errorf("index create (%s): %w", stmt, err)
		}
	}

	return nil
}
