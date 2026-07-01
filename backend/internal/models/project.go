package models

import "time"

// Project is a real-estate project marketed by Aapno Aavas (channel partner — not the developer).
type Project struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	Slug             string     `gorm:"uniqueIndex;size:200;not null" json:"slug"`
	Title            string     `gorm:"size:200;not null" json:"title"`
	DeveloperName    string     `gorm:"size:200" json:"developer_name"`
	City             string     `gorm:"size:100;index" json:"city"`
	Locality         string     `gorm:"size:150" json:"locality"`
	Type             string     `gorm:"size:20;index" json:"type"`   // residential | commercial
	BHKConfig        string     `gorm:"size:100" json:"bhk_config"`  // e.g. "2, 3 & 4 BHK"
	PriceMin         int64      `json:"price_min"`                   // rupees; 0 = "on request"
	PriceMax         int64      `json:"price_max"`
	Status           string     `gorm:"size:20;index" json:"status"` // upcoming | ongoing | ready
	ReraNo           string     `gorm:"size:120" json:"rera_no"`
	ReraAuthorityURL string     `gorm:"size:300" json:"rera_authority_url"`
	Description      string     `gorm:"type:text" json:"description"`
	Amenities        StringList `gorm:"type:jsonb" json:"amenities"`
	Tags             StringList `gorm:"type:jsonb" json:"tags"` // categorization: Luxury, Ready-to-move, etc.
	Lat              float64    `json:"lat"`
	Lng              float64    `json:"lng"`
	MetaTitle        string     `gorm:"size:200" json:"meta_title"`
	MetaDescription  string     `gorm:"size:320" json:"meta_description"`
	IsPublished      bool       `gorm:"index;default:false" json:"is_published"`
	Featured         bool       `gorm:"index;default:false" json:"featured"`
	Media            []Media    `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE" json:"media,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// Media is an image or video attached to a project (stored in Supabase Storage / public assets).
type Media struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ProjectID uint      `gorm:"index" json:"project_id"`
	URL       string    `gorm:"size:500;not null" json:"url"`
	Kind      string    `gorm:"size:10;default:image" json:"kind"` // image | video
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	Alt       string    `gorm:"size:200" json:"alt"`
	CreatedAt time.Time `json:"created_at"`
}
