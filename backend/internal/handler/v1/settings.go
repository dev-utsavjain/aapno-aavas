package v1

import (
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
)

// allowedSettings whitelists editable keys so admin can't spam arbitrary rows.
var allowedSettings = map[string]bool{
	"whatsapp_number": true,
	"phone":           true,
	"email":           true,
	"address":         true,
	"hours":           true,
	"map_query":       true,
	"contact_heading": true,
	"contact_intro":   true,
}

func settingsMap() (map[string]string, error) {
	var rows []models.Setting
	if err := db.DB.Find(&rows).Error; err != nil {
		return nil, err
	}
	m := map[string]string{}
	for _, s := range rows {
		m[s.Key] = s.Value
	}
	return m, nil
}

// GetSettings — public, returns all settings as a flat key→value map.
func GetSettings(c *gin.Context) {
	m, err := settingsMap()
	if err != nil {
		serverError(c, err)
		return
	}
	ok(c, m)
}

// AdminUpdateSettings — upsert a map of allowed key→value, then return the fresh map.
func AdminUpdateSettings(c *gin.Context) {
	var in map[string]string
	if err := c.ShouldBindJSON(&in); err != nil {
		badRequest(c, err.Error())
		return
	}
	for k, v := range in {
		if !allowedSettings[k] {
			continue // ignore unknown keys
		}
		s := models.Setting{Key: k, Value: v}
		if err := db.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "key"}},
			DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
		}).Create(&s).Error; err != nil {
			serverError(c, err)
			return
		}
	}
	GetSettings(c)
}
