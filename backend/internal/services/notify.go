package services

import (
	"bytes"
	"encoding/json"
	"imagine_backend/config"
	"log"
	"net/http"
	"time"
)

// NotifyNewLead posts a short message to LEAD_NOTIFY_WEBHOOK (Slack/Telegram/relay) so a new
// lead isn't sitting unseen in the admin panel. Fire-and-forget; failures only log.
func NotifyNewLead(name, phone, source, project string) {
	webhook := config.AppConfig.LeadNotifyWebhook
	if webhook == "" {
		return
	}
	text := "🏠 New lead: " + name + " (" + phone + ") via " + source
	if project != "" {
		text += " — " + project
	}
	payload, _ := json.Marshal(map[string]string{"text": text})

	go func() {
		client := &http.Client{Timeout: 8 * time.Second}
		resp, err := client.Post(webhook, "application/json", bytes.NewReader(payload))
		if err != nil {
			log.Printf("lead notify failed: %v", err)
			return
		}
		resp.Body.Close()
	}()
}
