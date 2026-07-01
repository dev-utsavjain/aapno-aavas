package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
	Env  string

	DBUser     string
	DBPassword string
	DBName     string
	DBHost     string
	DBPort     string
	DBSchema   string
	DBSslMode  string

	JWTSecret string

	// Admin bootstrap (seeded by the migration binary).
	AdminEmail    string
	AdminPassword string

	// Comma-separated list of origins allowed by CORS. Same-origin in prod, so this
	// is mostly for local dev / any split-origin deploy.
	AllowedOrigins []string

	// Public site config surfaced to the frontend / used server-side.
	SiteURL        string // absolute base URL, e.g. https://aapnoaavas.com (canonical + og:url)
	WhatsAppNumber string // E.164 without +, e.g. 919812345678

	// Cloudflare Turnstile (anti-spam on public lead form).
	TurnstileSecret string

	// Supabase Storage (media bucket). Optional — falls back to embedded/public assets.
	StorageEndpoint   string // https://<ref>.supabase.co/storage/v1
	StorageBucket     string
	StorageServiceKey string
	StoragePublicURL  string // https://<ref>.supabase.co/storage/v1/object/public/<bucket>

	// Lead notification webhook (Slack/Telegram/email relay). Optional.
	LeadNotifyWebhook string
}

var AppConfig *Config

func LoadConfig() {
	godotenv.Load()

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	} else {
		godotenv.Overload(".env." + env)
	}

	AppConfig = &Config{
		Port:       envOr("PORT", "8080"),
		Env:        env,
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     envOr("DB_PORT", "5432"),
		DBSchema:   os.Getenv("DB_SCHEMA"),
		// Supabase enforces SSL; only local dev uses `disable`.
		DBSslMode: envOr("DB_SSLMODE", "require"),

		JWTSecret: os.Getenv("JWT_SECRET"),

		AdminEmail:    os.Getenv("ADMIN_EMAIL"),
		AdminPassword: os.Getenv("ADMIN_PASSWORD"),

		AllowedOrigins: splitCSV(os.Getenv("ALLOWED_ORIGINS")),

		SiteURL:        strings.TrimRight(os.Getenv("SITE_URL"), "/"),
		WhatsAppNumber: os.Getenv("WHATSAPP_NUMBER"),

		TurnstileSecret: os.Getenv("TURNSTILE_SECRET"),

		StorageEndpoint:   strings.TrimRight(os.Getenv("STORAGE_ENDPOINT"), "/"),
		StorageBucket:     os.Getenv("STORAGE_BUCKET"),
		StorageServiceKey: os.Getenv("STORAGE_SERVICE_KEY"),
		StoragePublicURL:  strings.TrimRight(os.Getenv("STORAGE_PUBLIC_URL"), "/"),

		LeadNotifyWebhook: os.Getenv("LEAD_NOTIFY_WEBHOOK"),
	}

	// Fail fast on an insecure JWT secret in production — never fall back to a known default.
	if AppConfig.IsProd() {
		if len(AppConfig.JWTSecret) < 32 {
			log.Fatal("JWT_SECRET must be set to a strong value (>=32 chars) in production")
		}
	} else if AppConfig.JWTSecret == "" {
		AppConfig.JWTSecret = "dev-only-insecure-secret-do-not-use-in-prod"
		fmt.Println("WARNING: using insecure dev JWT secret (ENV != production)")
	}
}

func (c *Config) IsProd() bool { return c.Env == "production" }

// StorageConfigured reports whether Supabase Storage uploads are wired up.
func (c *Config) StorageConfigured() bool {
	return c.StorageEndpoint != "" && c.StorageBucket != "" && c.StorageServiceKey != ""
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
