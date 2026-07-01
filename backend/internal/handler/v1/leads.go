package v1

import (
	"encoding/csv"
	"errors"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"imagine_backend/internal/services"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// consentPolicyVersion is bumped whenever the T&C/Privacy consent wording changes, so each
// stored lead records which version it agreed to (DPDPA auditability).
const consentPolicyVersion = "2026-07-01"

type createLeadRequest struct {
	Name    string `json:"name" binding:"required,min=2"`
	Phone   string `json:"phone" binding:"required,min=6"`
	Email   string `json:"email" binding:"omitempty,email"`
	Message string `json:"message"`
	Source  string `json:"source"` // form | whatsapp
	// nullable project reference
	ProjectID *uint `json:"project_id"`
	// consents — both required true (enforced below, not by binding, to give clean messages)
	ConsentDataProcessing bool `json:"consent_data_processing"`
	ConsentTelecomDND     bool `json:"consent_telecom_dnd"`
	// anti-spam
	Honeypot       string `json:"company"` // hidden field; bots fill it, humans don't
	TurnstileToken string `json:"turnstile_token"`
}

// CreateLead — public. Honeypot + Turnstile + mandatory dual consent, then persist + notify.
func CreateLead(c *gin.Context) {
	var req createLeadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err.Error())
		return
	}

	// Honeypot: a filled hidden field means a bot. Pretend success to not tip them off.
	if strings.TrimSpace(req.Honeypot) != "" {
		c.JSON(201, gin.H{"ok": true})
		return
	}

	if !services.VerifyTurnstile(req.TurnstileToken, c.ClientIP()) {
		badRequest(c, "verification failed, please try again")
		return
	}

	if !req.ConsentDataProcessing || !req.ConsentTelecomDND {
		badRequest(c, "both consent checkboxes are required to submit an inquiry")
		return
	}

	source := req.Source
	if source != "whatsapp" {
		source = "form"
	}

	lead := models.Lead{
		Name:                  strings.TrimSpace(req.Name),
		Phone:                 strings.TrimSpace(req.Phone),
		Email:                 strings.TrimSpace(req.Email),
		ProjectID:             req.ProjectID,
		Message:               strings.TrimSpace(req.Message),
		Source:                source,
		Status:                "new",
		ConsentDataProcessing: req.ConsentDataProcessing,
		ConsentTelecomDND:     req.ConsentTelecomDND,
		ConsentPolicyVersion:  consentPolicyVersion,
		ConsentTimestamp:      time.Now(),
		ConsentIP:             c.ClientIP(),
	}
	if err := db.DB.Create(&lead).Error; err != nil {
		serverError(c, err)
		return
	}

	projectName := ""
	if lead.ProjectID != nil {
		var p models.Project
		if db.DB.Select("title").First(&p, *lead.ProjectID).Error == nil {
			projectName = p.Title
		}
	}
	services.NotifyNewLead(lead.Name, lead.Phone, lead.Source, projectName)

	c.JSON(201, gin.H{"ok": true, "id": lead.ID})
}

// ---- Admin ----

func AdminListLeads(c *gin.Context) {
	p := parsePage(c)
	base := db.DB.Model(&models.Lead{})
	if status := c.Query("status"); status != "" {
		base = base.Where("status = ?", status)
	}
	if source := c.Query("source"); source != "" {
		base = base.Where("source = ?", source)
	}
	if q := c.Query("q"); q != "" {
		like := "%" + q + "%"
		base = base.Where("name ILIKE ? OR phone ILIKE ? OR email ILIKE ?", like, like, like)
	}

	var total int64
	base.Count(&total)

	var leads []models.Lead
	if err := base.Order("created_at DESC, id DESC").Limit(p.Limit).Offset(p.Offset).Find(&leads).Error; err != nil {
		serverError(c, err)
		return
	}
	ok(c, listResponse{Data: leads, Total: total, Page: p.Page, Limit: p.Limit})
}

type patchLeadRequest struct {
	Status *string `json:"status"`
	Notes  *string `json:"notes"`
}

func AdminUpdateLead(c *gin.Context) {
	id := c.Param("id")
	var lead models.Lead
	if err := db.DB.First(&lead, id).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		notFound(c)
		return
	}
	var req patchLeadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err.Error())
		return
	}
	updates := map[string]any{}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.Notes != nil {
		updates["notes"] = *req.Notes
	}
	if len(updates) > 0 {
		if err := db.DB.Model(&lead).Updates(updates).Error; err != nil {
			serverError(c, err)
			return
		}
	}
	ok(c, lead)
}

// ExportLeadsCSV streams all leads as CSV. Guards against CSV formula injection (phone starts
// with +91) and prepends a UTF-8 BOM so Excel renders names correctly.
func ExportLeadsCSV(c *gin.Context) {
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=leads.csv")
	c.Writer.Write([]byte{0xEF, 0xBB, 0xBF}) // UTF-8 BOM

	w := csv.NewWriter(c.Writer)
	_ = w.Write([]string{"ID", "Name", "Phone", "Email", "Project ID", "Message", "Source", "Status",
		"Consent Data", "Consent DND", "Consent Version", "Consent Time", "Created At", "Notes"})

	rows, err := db.DB.Model(&models.Lead{}).Order("created_at DESC").Rows()
	if err != nil {
		serverError(c, err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var l models.Lead
		if err := db.DB.ScanRows(rows, &l); err != nil {
			continue
		}
		projectID := ""
		if l.ProjectID != nil {
			projectID = itoa(*l.ProjectID)
		}
		_ = w.Write([]string{
			itoa(l.ID), csvSafe(l.Name), csvSafe(l.Phone), csvSafe(l.Email), projectID,
			csvSafe(l.Message), l.Source, l.Status,
			boolStr(l.ConsentDataProcessing), boolStr(l.ConsentTelecomDND), l.ConsentPolicyVersion,
			l.ConsentTimestamp.Format(time.RFC3339), l.CreatedAt.Format(time.RFC3339), csvSafe(l.Notes),
		})
	}
	w.Flush()
}

// csvSafe neutralizes CSV/formula injection: fields starting with = + - @ (tab/CR) get a
// leading apostrophe so spreadsheets treat them as text.
func csvSafe(s string) string {
	if s == "" {
		return s
	}
	switch s[0] {
	case '=', '+', '-', '@', '\t', '\r':
		return "'" + s
	}
	return s
}

func boolStr(b bool) string {
	if b {
		return "yes"
	}
	return "no"
}

func itoa[T ~uint | ~int](v T) string {
	// small helper avoiding strconv import churn
	if v == 0 {
		return "0"
	}
	neg := v < 0
	var buf [24]byte
	i := len(buf)
	n := int64(v)
	if neg {
		n = -n
	}
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
