package services

import (
	"bytes"
	"fmt"
	"imagine_backend/config"
	"io"
	"net/http"
)

// StorageAvailable reports whether Supabase Storage uploads are configured.
func StorageAvailable() bool { return config.AppConfig.StorageConfigured() }

// UploadToStorage puts an object into the configured Supabase Storage bucket and returns its
// public URL. Uses the Storage REST API (S3-compatible endpoints also exist, but this is the
// smallest correct path for a service-key upload).
func UploadToStorage(objectPath, contentType string, data []byte) (string, error) {
	c := config.AppConfig
	if !c.StorageConfigured() {
		return "", fmt.Errorf("storage not configured")
	}

	uploadURL := fmt.Sprintf("%s/object/%s/%s", trimSlash(c.StorageEndpoint), c.StorageBucket, objectPath)
	req, err := http.NewRequest(http.MethodPost, uploadURL, bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+c.StorageServiceKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "true")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("storage upload failed (%d): %s", resp.StatusCode, string(body))
	}

	// Public URL: prefer explicit STORAGE_PUBLIC_URL, else derive the standard public path.
	if c.StoragePublicURL != "" {
		return fmt.Sprintf("%s/%s", trimSlash(c.StoragePublicURL), objectPath), nil
	}
	return fmt.Sprintf("%s/object/public/%s/%s", trimSlash(c.StorageEndpoint), c.StorageBucket, objectPath), nil
}
