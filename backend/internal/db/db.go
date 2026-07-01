package db

import (
	"fmt"
	"imagine_backend/config"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectToDB() {
	c := config.AppConfig

	// sslmode is env-driven (`require` for Supabase, `disable` for local). search_path is
	// only appended when a schema is configured. For Supabase, connect through the SESSION
	// pooler host (aws-0-<region>.pooler.supabase.com:5432, user postgres.<ref>) — the direct
	// host is IPv6-only and Railway cannot route it.
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Kolkata",
		c.DBHost, c.DBUser, c.DBPassword, c.DBName, c.DBPort, c.DBSslMode,
	)
	if c.DBSchema != "" {
		dsn += " search_path=" + c.DBSchema
	}

	gormCfg := &gorm.Config{}
	if !c.IsProd() {
		gormCfg.Logger = logger.Default.LogMode(logger.Warn)
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), gormCfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)
}
