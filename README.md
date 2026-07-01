# Aapno Aavas — Real Estate Lead-Gen Platform

Premium property-showcase + lead-generation site for **Aapno Aavas**, a Jaipur real-estate
channel-partner / advisory firm. Public marketing site + admin CMS.

- `backend/` — Go (Gin + GORM + JWT) API that also serves the embedded React SPA and injects
  per-project SEO meta at request time. One Railway service.
- `frontend/` — Vite + React + TS SPA (builds into `backend/internal/dist`, embedded at compile time).
- `assets-seed/` — provided interior photos/videos + logo used to seed the media gallery.
- `docs/` — business requirements, terms, admin guide, deployment runbook.

See `../../.claude/plans/jazzy-discovering-tome.md` for the full build plan and design system.

## Quick start (local)

```bash
# backend
cd backend && cp .env.example .env   # fill DB + secrets
go run ./cmd/migration/main.go        # create tables + seed admin
go run ./cmd/server/main.go           # http://localhost:8080

# frontend (separate terminal, dev)
cd frontend && npm install && npm run dev   # http://localhost:5173, proxies /api → :8080
```

Stack: React+TS · Go · Railway · Railway-hosted Supabase Postgres.
