// Probe seed walkthroughs + dump sample frames so we can pick the best hero/showcase clip.
import ffprobe from "ffprobe-static";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "..", "assets-seed", "videos");
const OUT = process.argv[2] || join(process.cwd(), "..", "..", "..", "tmp-frames");
mkdirSync(OUT, { recursive: true });

const clips = readdirSync(SRC).filter((f) => f.toLowerCase().endsWith(".mp4"));
clips.forEach((clip, i) => {
  const input = join(SRC, clip);
  const meta = execFileSync(ffprobe.path, [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,duration,avg_frame_rate",
    "-of", "default=noprint_wrappers=1", input,
  ]).toString().trim().replace(/\n/g, "  ");
  console.log(`clip ${i} :: ${clip}\n         ${meta}`);
  // grab a frame ~35% in
  execFileSync(ffmpegPath, [
    "-y", "-ss", "3", "-i", input, "-frames:v", "1", "-vf", "scale=640:-1",
    join(OUT, `clip${i}.jpg`),
  ], { stdio: "ignore" });
});
console.log("frames ->", OUT);
