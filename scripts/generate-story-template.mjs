#!/usr/bin/env node
/**
 * Keys the checkerboard background out of the designer JPG and writes a
 * transparent 1080×1920 Instagram Story overlay PNG.
 *
 * Source: assets/source/story-template-src.jpg (gitignored)
 * Output: public/assets/ballroom/story-template.png
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "assets/source/story-template-src.jpg");
const outPng = resolve(root, "public/assets/ballroom/story-template.png");
const OUT_W = 1080;
const OUT_H = 1920;

if (!existsSync(src)) {
  console.error("Missing source:", src);
  process.exit(1);
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const rgba = Buffer.alloc(width * height * 4);

for (let i = 0; i < width * height; i++) {
  const o = i * channels;
  const r = data[o];
  const g = data[o + 1];
  const b = data[o + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  const brightness = (r + g + b) / 3;

  // Checkerboard is near-neutral and bright. Logo is rose-gold (sat ≥ 26).
  // Hashtag text is dark (bri ≲ 120). Soft ramp only for mid-edge pixels.
  let alpha = 255;
  if (sat < 20 && brightness > 130) {
    alpha = 0;
  } else if (sat < 28 && brightness > 150) {
    const t = Math.max((sat - 18) / 10, (180 - brightness) / 30);
    alpha = Math.round(255 * Math.min(1, Math.max(0, t)));
  }

  const d = i * 4;
  if (alpha < 8) {
    rgba[d] = 0;
    rgba[d + 1] = 0;
    rgba[d + 2] = 0;
    rgba[d + 3] = 0;
  } else {
    rgba[d] = r;
    rgba[d + 1] = g;
    rgba[d + 2] = b;
    rgba[d + 3] = alpha;
  }
}

// Drop isolated speckles left by JPEG noise (keep only if a neighbor has content).
const cleaned = Buffer.from(rgba);
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const i = (y * width + x) * 4;
    if (rgba[i + 3] === 0) continue;
    if (rgba[i + 3] > 40) continue;
    let neighbors = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const n = ((y + dy) * width + (x + dx)) * 4;
        if (rgba[n + 3] > 40) neighbors++;
      }
    }
    if (neighbors < 2) {
      cleaned[i] = 0;
      cleaned[i + 1] = 0;
      cleaned[i + 2] = 0;
      cleaned[i + 3] = 0;
    }
  }
}

await sharp(cleaned, { raw: { width, height, channels: 4 } })
  .resize(OUT_W, OUT_H, { fit: "fill", kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toFile(outPng);

console.log("Wrote", outPng);

const verifyDir = resolve(root, "assets/source");
await sharp({
  create: { width: OUT_W, height: OUT_H, channels: 3, background: { r: 0, g: 0, b: 0 } },
})
  .composite([{ input: outPng, blend: "over" }])
  .jpeg({ quality: 90 })
  .toFile(resolve(verifyDir, "story-template-on-black.jpg"));
await sharp({
  create: { width: OUT_W, height: OUT_H, channels: 3, background: { r: 255, g: 255, b: 255 } },
})
  .composite([{ input: outPng, blend: "over" }])
  .jpeg({ quality: 90 })
  .toFile(resolve(verifyDir, "story-template-on-white.jpg"));

const meta = await sharp(outPng).metadata();
console.log("meta", meta.width, meta.height, meta.hasAlpha, meta.format);
console.log("Wrote verify composites in assets/source/");
