package models

import "time"

// Banner is a promotional slide/banner (home hero, etc.), managed in admin.
type Banner struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ImageURL  string    `gorm:"size:500;not null" json:"image_url"`
	Link      string    `gorm:"size:500" json:"link"`
	Headline  string    `gorm:"size:200" json:"headline"`
	Subtext   string    `gorm:"size:300" json:"subtext"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	Active    bool      `gorm:"default:true;index" json:"active"`
	Placement string    `gorm:"size:30;default:home_hero" json:"placement"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Testimonial is a customer quote shown on the home page, managed in admin.
type Testimonial struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:150;not null" json:"name"`
	Quote     string    `gorm:"type:text;not null" json:"quote"`
	Location  string    `gorm:"size:150" json:"location"`
	PhotoURL  string    `gorm:"size:500" json:"photo_url"`
	Rating    int       `gorm:"default:5" json:"rating"` // 1..5 stars
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	Active    bool      `gorm:"default:true;index" json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Page is an editable informational page (About, Privacy, Terms, ...). Body is sanitized HTML.
type Page struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Slug            string    `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Title           string    `gorm:"size:200" json:"title"`
	Body            string    `gorm:"type:text" json:"body"`
	MetaTitle       string    `gorm:"size:200" json:"meta_title"`
	MetaDescription string    `gorm:"size:320" json:"meta_description"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Setting is one editable site-wide value (contact details, WhatsApp number, contact-page copy),
// managed in admin. Key/value so adding a field needs no migration.
type Setting struct {
	Key       string    `gorm:"primaryKey;size:60" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

// AdminUser is a CMS operator. No public signup — seeded via env by the migration binary.
type AdminUser struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;size:150;not null" json:"email"`
	PasswordHash string    `gorm:"size:100;not null" json:"-"`
	Role         string    `gorm:"size:20;default:admin" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
