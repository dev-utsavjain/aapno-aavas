package main

import (
	"log"

	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/services"
)

func main() {
	config.LoadConfig()
	db.ConnectToDB()
	if err := db.Migrate(); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	// Idempotent admin bootstrap — mirrors server boot so a manual migration also seeds.
	if err := services.Seed(); err != nil {
		log.Fatalf("seed failed: %v", err)
	}
	log.Println("Migrations completed successfully.")
}
