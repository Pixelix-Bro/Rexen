// Ishlatish (loyiha ildizidan):
//   node scripts/extract-frames.mjs
//   node scripts/extract-frames.mjs public/media/back.mp4 --frames 140 --quality 65
//
// Kerak: ffmpeg (libwebp bilan) va ffprobe, PATH'da turishi kerak.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const input = resolve(args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")) ?? "public/media/back.mp4");
const targetFrames = Math.min(Number(flag("frames", 120)), 999); // kadrlar soni (taxminan)
const quality = Number(flag("quality", 60)); // WebP sifati, 0-100
const outputs = [
  { dir: resolve("public/media/frames"), width: 1600, quality }, // kompyuter
  { dir: resolve("public/media/frames-sm"), width: 800, quality: Math.max(quality - 5, 30) }, // telefon
];

const run = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

try {
  run("ffmpeg", ["-version"]);
  run("ffprobe", ["-version"]);
} catch {
  console.error("ffmpeg yoki ffprobe topilmadi. Avval o'rnating: https://ffmpeg.org/download.html");
  process.exit(1);
}

if (!existsSync(input)) {
  console.error(`Video topilmadi: ${input}`);
  process.exit(1);
}

const duration = parseFloat(
  run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", input]).trim()
);
if (!Number.isFinite(duration) || duration <= 0) {
  console.error("Video uzunligini aniqlab bo'lmadi.");
  process.exit(1);
}

// Uzun video uchun fps past, qisqa video uchun yuqoriroq (eng ko'pi bilan 30)
const fps = Math.min(30, targetFrames / duration);
console.log(`Video: ${duration.toFixed(2)} s, ${fps.toFixed(3)} fps, taxminan ${Math.round(duration * fps)} kadr`);

let count = 0;
for (const { dir, width, quality: q } of outputs) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  run("ffmpeg", [
    "-y", "-v", "error",
    "-i", input,
    "-an",
    "-vf", `fps=${fps.toFixed(4)},scale=${width}:-2:flags=lanczos`,
    "-c:v", "libwebp",
    "-quality", String(q),
    "-compression_level", "6",
    join(dir, "f_%03d.webp"),
  ]);

  const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
  const bytes = files.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
  count = files.length;

  writeFileSync(join(dir, "meta.json"), JSON.stringify({ count, width, fps: Number(fps.toFixed(3)) }));
  console.log(`${dir}\n  ${count} kadr, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
}

console.log("Tayyor. Hero komponenti kadrlar sonini meta.json dan o'zi oladi.");
