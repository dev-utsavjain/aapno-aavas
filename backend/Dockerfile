# syntax=docker/dockerfile:1

# ---- Stage 1: build the React frontend into the Go embed dir ----
FROM node:20-alpine AS web
WORKDIR /web
# frontend lives one level up from backend in the repo; Railway build context is the repo root.
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
# vite.config builds into ../backend/internal/dist — but here backend isn't present, so build
# locally then copy. Output dir is set via env for the Docker context.
RUN npm run build

# ---- Stage 2: build Go binaries with the real frontend embedded ----
FROM golang:1.26-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
# Replace the placeholder dist with the actual Vite build so //go:embed all:dist captures it.
RUN rm -rf internal/dist && mkdir -p internal/dist
COPY --from=web /web/dist/ ./internal/dist/
# Fail the build if the embed dir is still empty / a stub.
RUN test -f internal/dist/index.html && test -d internal/dist/assets \
    || (echo "ERROR: frontend build not embedded (internal/dist missing index.html/assets)" && exit 1)

RUN CGO_ENABLED=0 GOOS=linux go build -o bin/migration ./cmd/migration
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/imagine_backend ./cmd/server

# ---- Stage 3: runtime ----
FROM alpine:latest
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/bin/migration ./bin/
COPY --from=builder /app/bin/imagine_backend ./bin/
COPY --from=builder /app/start.sh ./
RUN chmod +x ./start.sh
EXPOSE 8080
CMD ["./start.sh"]
