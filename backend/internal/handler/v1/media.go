package v1

import (
	"fmt"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"imagine_backend/internal/services"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
)

const (
	maxImageBytes = 10 << 20 // 10 MB
	maxVideoBytes = 60 << 20 // 60 MB
)

var allowedMime = map[string]string{
	"image/jpeg": "image",
	"image/png":  "image",
	"image/webp": "image",
	"video/mp4":  "video",
}

// AdminUploadMedia accepts a multipart file, validates size + sniffed content-type against an
// allowlist, uploads to Supabase Storage, and records a Media row.
func AdminUploadMedia(c *gin.Context) {
	if !isStorageReady(c) {
		return
	}

	projectID, err := strconv.ParseUint(c.PostForm("project_id"), 10, 64)
	if err != nil {
		badRequest(c, "valid project_id is required")
		return
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		badRequest(c, "file is required")
		return
	}
	if fileHeader.Size > maxVideoBytes {
		badRequest(c, "file too large")
		return
	}

	f, err := fileHeader.Open()
	if err != nil {
		serverError(c, err)
		return
	}
	defer f.Close()
	data, err := io.ReadAll(f)
	if err != nil {
		serverError(c, err)
		return
	}

	mtype := mimetype.Detect(data)
	kind, allowed := allowedMime[mtype.String()]
	if !allowed {
		badRequest(c, "unsupported file type: "+mtype.String())
		return
	}
	if kind == "image" && len(data) > maxImageBytes {
		badRequest(c, "image too large (max 10MB)")
		return
	}

	objectPath := fmt.Sprintf("projects/%d/%d%s", projectID, time.Now().UnixNano(), mtype.Extension())
	publicURL, err := services.UploadToStorage(objectPath, mtype.String(), data)
	if err != nil {
		serverError(c, err)
		return
	}

	sort, _ := strconv.Atoi(c.PostForm("sort_order"))
	media := models.Media{
		ProjectID: uint(projectID),
		URL:       publicURL,
		Kind:      kind,
		SortOrder: sort,
		Alt:       strings.TrimSpace(c.PostForm("alt")),
	}
	if err := db.DB.Create(&media).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(201, media)
}

type createMediaByURLRequest struct {
	ProjectID uint   `json:"project_id" binding:"required"`
	URL       string `json:"url" binding:"required,url"`
	Kind      string `json:"kind"`
	Alt       string `json:"alt"`
	SortOrder int    `json:"sort_order"`
}

// AdminCreateMediaByURL registers already-hosted media (e.g. seed assets in the public bundle
// or an external CDN) without an upload — used to seed the gallery.
func AdminCreateMediaByURL(c *gin.Context) {
	var req createMediaByURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err.Error())
		return
	}
	kind := req.Kind
	if kind != "video" {
		kind = "image"
	}
	media := models.Media{
		ProjectID: req.ProjectID,
		URL:       req.URL,
		Kind:      kind,
		Alt:       strings.TrimSpace(req.Alt),
		SortOrder: req.SortOrder,
	}
	if err := db.DB.Create(&media).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(201, media)
}

func AdminDeleteMedia(c *gin.Context) {
	if err := db.DB.Delete(&models.Media{}, c.Param("id")).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(204)
}

func isStorageReady(c *gin.Context) bool {
	if !services.StorageAvailable() {
		c.JSON(503, gin.H{"error": "media storage not configured (set STORAGE_* env vars) — or add media by URL"})
		return false
	}
	return true
}
