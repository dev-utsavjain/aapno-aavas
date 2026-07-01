// Design-lint gate: fails the build if any AI-slop signal appears in src/.
// Enforces the design system's hard "avoid" list. Run via `npm run lint:design`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src", import.meta.url));

// Banned Tailwind/CSS tokens and fonts that read as generic template output.
const BANNED = [
  /\b(?:bg|text|border|from|to|via)-(?:indigo|violet|purple|fuchsia)-\d/,
  /\b(?:bg|text)-(?:slate|zinc|gray|neutral)-900\b/,
  /\brounded-(?:2xl|3xl|full)\b(?![^<]*(?:rounded-full"[^>]*aria|avatar|thumb))/, // allow rounded-full only rarely
  /\bshadow-(?:lg|xl|2xl)\b/,
  /\bfont-(?:inter|poppins|montserrat|roboto)\b/,
  /from-\w+-\d+\s+to-\w+-\d+/, // gradient pairs
];
// rounded-full is allowed (used for icon buttons); drop it from the banned regex above by exception.
const ALLOW_ROUNDED_FULL = true;

const exts = new Set([".tsx", ".ts", ".css"]);
let violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (exts.has(p.slice(p.lastIndexOf(".")))) scan(p);
  }
}

function scan(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const re of BANNED) {
      if (re.source.includes("2xl|3xl|full") && ALLOW_ROUNDED_FULL) {
        if (/\brounded-(?:2xl|3xl)\b/.test(line)) {
          violations.push(`${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
        }
        continue;
      }
      if (re.test(line)) {
        violations.push(`${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
        break;
      }
    }
  });
}

walk(SRC);

if (violations.length) {
  console.error(`\n✗ design-lint: ${violations.length} AI-slop token(s) found:\n`);
  violations.forEach((v) => console.error("  " + v));
  console.error("\nSee the design system: no indigo/violet/purple, no slate-900, no rounded-2xl/3xl, no shadow-lg/xl, no gradient washes, no Inter/Poppins.\n");
  process.exit(1);
}
console.log("✓ design-lint: no AI-slop tokens found");
