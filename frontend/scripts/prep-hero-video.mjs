// One-time local prep: compress the best seed walkthroughs into web-weight, cinematically-graded
// hero + showcase clips (+ posters). Outputs are committed to public/ and embedded by the Go build.
// ffmpeg does NOT run in Docker. Run: npm run prep:video
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "..", "assets-seed", "videos");
const VID = join(process.cwd(), "public", "video");
const IMG = join(process.cwd(), "public", "img");
mkdirSync(VID, { recursive: true });
mkdirSync(IMG, { recursive: true });

// clip1 = clean continuous furnished interior (sofas/niches/bedroom), 720x1280, ~21s. Brand-safe hero.
const HERO_SRC = join(SRC, "WhatsApp Video 2026-06-30 at 6.39.28 PM.mp4");
// clip2's first ~7s = living rooms (before its drone/utility/branded-signage shots). Showcase only.
const SHOW_SRC = join(SRC, "WhatsApp Video 2026-06-30 at 6.39.42 PM.mp4");

// Subtle cinematic grade: gentle contrast/saturation, slight darken, soft vignette.
const GRADE = "eq=contrast=1.07:saturation=1.05:brightness=-0.02,vignette=PI/4.5";

function ff(args) {
  execFileSync(ffmpegPath, ["-y", ...args], { stdio: "ignore" });
}

console.log("encoding hero.mp4 …");
ff([
  "-ss", "0.5", "-t", "16", "-i", HERO_SRC,
  "-vf", `${GRADE},scale=720:1280:flags=lanczos`,
  "-an", "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
  "-crf", "25", "-preset", "slow", "-movflags", "+faststart",
  join(VID, "hero.mp4"),
]);

console.log("extracting hero-poster.jpg …");
ff([
  "-ss", "7", "-i", HERO_SRC, "-frames:v", "1",
  "-vf", `${GRADE},scale=720:-1`, "-q:v", "3",
  join(IMG, "hero-poster.jpg"),
]);

console.log("encoding showcase.mp4 …");
ff([
  "-ss", "1", "-t", "6", "-i", SHOW_SRC,
  "-vf", `${GRADE},scale=720:1280:flags=lanczos`,
  "-an", "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
  "-crf", "27", "-preset", "slow", "-movflags", "+faststart",
  join(VID, "showcase.mp4"),
]);

console.log("extracting showcase-poster.jpg …");
ff([
  "-ss", "2", "-i", SHOW_SRC, "-frames:v", "1",
  "-vf", `${GRADE},scale=720:-1`, "-q:v", "3",
  join(IMG, "showcase-poster.jpg"),
]);

console.log("done → public/video/{hero,showcase}.mp4, public/img/{hero,showcase}-poster.jpg");
