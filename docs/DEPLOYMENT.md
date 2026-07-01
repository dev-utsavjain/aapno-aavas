# Deployment Runbook — Aapno Aavas

Single Railway service runs the Go binary, which serves the API **and** the embedded React SPA,
backed by a Railway-hosted Supabase Postgres database.

## 1. Database (Supabase)

Create a Supabase project (or deploy Supabase on Railway). Then:

- **Connection:** use the **Session Pooler** connection (Supabase → Project Settings → Database →
  Connection string → *Session pooler*). The direct host is IPv6-only and Railway cannot reach it.
  - `DB_HOST` = `aws-0-<region>.pooler.supabase.com`
  - `DB_USER` = `postgres.<project-ref>`
  - `DB_PORT` = `5432`
  - `DB_SSLMODE` = `require`
  - `DB_NAME` = `postgres`, `DB_PASSWORD` = your DB password, `DB_SCHEMA` = `public`
- **Storage (media):** create a **public** bucket named `media`. Copy the Storage endpoint and the
  `service_role` key into `STORAGE_*` env vars. (If you skip this, admin file-upload returns 503 and
  you add media by URL instead.)

## 2. Railway service

- New service → Deploy from the repo. Root/build uses the repo-root `Dockerfile` at `backend/Dockerfile`
  (multi-stage: builds the frontend, embeds it, builds Go). Set the service's **Dockerfile path** to
  `backend/Dockerfile` and **build context** to the repo root.
- **Healthcheck:** `/api/health` (already in `railway.toml`).
- **Start command:** `./start.sh` (runs migrations + admin seed, then the server).

## 3. Environment variables (Railway → Variables)

| Var | Example / note |
|---|---|
| `ENV` | `production` |
| `PORT` | Railway injects; app also defaults 8080 |
| `DB_HOST/USER/PASSWORD/NAME/PORT/SCHEMA` | Supabase session pooler (above) |
| `DB_SSLMODE` | `require` |
| `JWT_SECRET` | **≥32 random chars** — app refuses to boot in prod without it |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seeds the first CMS admin (idempotent) |
| `SITE_URL` | `https://<your-domain>` (canonical + og:url + sitemap) |
| `ALLOWED_ORIGINS` | `https://<your-domain>` (same-origin; CORS allowlist) |
| `WHATSAPP_NUMBER` | E.164 w/o `+`, e.g. `9198…` |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret (anti-spam) |
| `STORAGE_ENDPOINT/BUCKET/SERVICE_KEY/PUBLIC_URL` | Supabase Storage (media uploads) |
| `LEAD_NOTIFY_WEBHOOK` | Slack/Telegram/relay webhook (optional new-lead alert) |

Frontend build-time vars (set at build; baked into the bundle by the Dockerfile's Node stage — pass as
Railway build args or a committed `.env.production` in `frontend/`): `VITE_WHATSAPP_NUMBER`, `VITE_SITE_URL`,
`VITE_GA4_ID`, `VITE_TURNSTILE_SITEKEY`, `VITE_PHONE`, `VITE_EMAIL`.

## 4. First deploy checklist

1. `start.sh` runs the migration binary → creates tables, GIN/composite indexes, seeds the admin.
2. Visit `https://<domain>/api/health` → `{"status":"ok"}` (or 200).
3. Log in at `https://<domain>/admin/login` with `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
4. Create + publish a project, add media, confirm it appears at `/projects/<slug>`.
5. `curl -s https://<domain>/projects/<slug> | grep -i '<title>'` → shows the project's real title
   (server-side meta injection working).
6. `https://<domain>/sitemap.xml` lists published projects; `/robots.txt` disallows `/admin`.
7. Submit a lead on the public site → appears in `/admin/leads`; export CSV opens cleanly in Excel.

## 5. Local development

```bash
# Backend
cd backend && cp .env.example .env      # DB_SSLMODE=disable for local Postgres
go run ./cmd/migration/main.go          # migrate + seed admin
go run ./cmd/server/main.go             # :8080

# Frontend (dev, hot reload, proxies /api → :8080)
cd frontend && npm install && npm run dev   # :5173

# Single-binary test (build SPA, embed, run Go)
cd frontend && npm run build:embed
cd ../backend && go run ./cmd/server/main.go   # serves SPA + API + SEO at :8080
```
