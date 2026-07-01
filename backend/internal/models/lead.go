package models

import "time"

// Lead is a customer inquiry from the contact/project form or a WhatsApp click.
// Consent fields are auditable per DPDPA (verifiable consent) + TRAI/TCCCPR DND override.
type Lead struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `gorm:"size:150;not null" json:"name"`
	Phone     string `gorm:"size:20;not null" json:"phone"`
	Email     string `gorm:"size:150" json:"email"`
	ProjectID *uint  `gorm:"index" json:"project_id"`
	Message   string `gorm:"type:text" json:"message"`
	Source    string `gorm:"size:20;default:form;index" json:"source"` // form | whatsapp
	Status    string `gorm:"size:20;default:new;index" json:"status"`  // new|contacted|qualified|closed|lost

	ConsentDataProcessing bool      `json:"consent_data_processing"`
	ConsentTelecomDND     bool      `json:"consent_telecom_dnd"`
	ConsentPolicyVersion  string    `gorm:"size:20" json:"consent_policy_version"`
	ConsentTimestamp      time.Time `json:"consent_timestamp"`
	ConsentIP             string    `gorm:"size:64" json:"consent_ip"`

	Notes     string    `gorm:"type:text" json:"notes"`
	CreatedAt time.Time `gorm:"index" json:"created_at"`
}
