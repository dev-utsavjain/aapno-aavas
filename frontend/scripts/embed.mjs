// Copies the Vite build (dist/) into the Go backend's embed dir so a local `go run`/`go build`
// serves the real SPA. The Docker build does this via a COPY instead. Run: npm run build:embed.
import { cpSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");
const target = join(here, "..", "..", "backend", "internal", "dist");

if (!existsSync(dist)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(dist, target, { recursive: true });
console.log(`✓ embedded frontend build into ${target}`);
