package services

import (
	"encoding/json"
	"imagine_backend/config"
	"net/http"
	"net/url"
	"strings"
)

// VerifyTurnstile validates a Cloudflare Turnstile token. Returns true when the token is
// valid, or when Turnstile is not configured (dev / not-yet-set-up) so local flows work.
func VerifyTurnstile(token, remoteIP string) bool {
	secret := config.AppConfig.TurnstileSecret
	if secret == "" {
		return true // ponytail: no secret configured => skip; enforced once TURNSTILE_SECRET is set
	}
	if token == "" {
		return false
	}

	resp, err := http.PostForm("https://challenges.cloudflare.com/turnstile/v0/siteverify", url.Values{
		"secret":   {secret},
		"response": {token},
		"remoteip": {remoteIP},
	})
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	var out struct {
		Success bool `json:"success"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return false
	}
	return out.Success
}

// trimSlash is used by other services in this package.
func trimSlash(s string) string { return strings.TrimRight(s, "/") }
