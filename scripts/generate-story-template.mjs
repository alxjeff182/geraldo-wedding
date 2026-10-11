#!/usr/bin/env node
/**
 * Build a crisp transparent 1080×1920 Instagram Story overlay.
 *
 * Composites the high-res GC logo (downscaled, never upscaled) plus a
 * vector-rendered hashtag — avoids keying + upscaling a small JPEG.
 *
 * Usage:
 *   node scripts/generate-story-template.mjs
 *   node scripts/generate-story-template.mjs "#GeralDOanythingforChristine"
 *
 * Output: public/assets/ballroom/story-template.png
 * Verify: assets/source/story-template-on-{black,white}.jpg (gitignored)
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = resolve(root, "public/assets/ballroom/logo.png");
const outPng = resolve(root, "public/assets/ballroom/story-template.png");
const verifyDir = resolve(root, "assets/source");

const OUT_W = 1080;
const OUT_H = 1920;
const LOGO_W = 220;
const LOGO_TOP = 1488;
const TAG_TOP = 1768;
const TAG_COLOR = "#8a6f66";
const TAG_FONT_SIZE = 46;
const DEFAULT_TAG = "#GeralDOanythingforChristine";

/** Prefer Georgia (macOS Supplemental); fall back to Times New Roman. */
const FONT_CANDIDATES = [
  "/System/Library/Fonts/Supplemental/Georgia.ttf",
  "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
  "/Library/Fonts/Georgia.ttf",
];

const hashtag = (process.argv[2] || DEFAULT_TAG).trim() || DEFAULT_TAG;
const tagText = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;

if (!existsSync(logoPath)) {
  console.error("Missing logo:", logoPath);
  process.exit(1);
}

const fontfile = FONT_CANDIDATES.find((p) => existsSync(p));
if (!fontfile) {
  console.error("No serif TTF found. Install Georgia or Times New Roman.");
  process.exit(1);
}

// Trim transparent padding, then downscale — never upscale the logo.
const logoBuf = await sharp(logoPath)
  .trim({ threshold: 8 })
  .resize({ width: LOGO_W, withoutEnlargement: true, kernel: "lanczos3" })
  .png()
  .toBuffer();

const logoMeta = await sharp(logoBuf).metadata();
const logoLeft = Math.round((OUT_W - (logoMeta.width ?? LOGO_W)) / 2);

// Vector text via SVG + embedded @font-face (librsvg).
const tagSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OUT_W}" height="88">
  <defs>
    <style>
      @font-face {
        font-family: "StorySerif";
        src: url("file://${fontfile}");
      }
    </style>
  </defs>
  <text
    x="50%"
    y="58"
    text-anchor="middle"
    font-family="StorySerif, Georgia, serif"
    font-size="${TAG_FONT_SIZE}"
    fill="${TAG_COLOR}"
  >${escapeXml(tagText)}</text>
</svg>`);

const tagBuf = await sharp(tagSvg).png().toBuffer();

await sharp({
  create: {
    width: OUT_W,
    height: OUT_H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: logoBuf, left: logoLeft, top: LOGO_TOP },
    { input: tagBuf, left: 0, top: TAG_TOP },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outPng);

console.log("Wrote", outPng);
console.log("Hashtag:", tagText);
console.log("Font:", fontfile);
console.log("Logo:", logoMeta.width, "x", logoMeta.height, "at", logoLeft, LOGO_TOP);

await sharp({
  create: { width: OUT_W, height: OUT_H, channels: 3, background: { r: 0, g: 0, b: 0 } },
})
  .composite([{ input: outPng, blend: "over" }])
  .jpeg({ quality: 92 })
  .toFile(resolve(verifyDir, "story-template-on-black.jpg"));

await sharp({
  create: {
    width: OUT_W,
    height: OUT_H,
    channels: 3,
    background: { r: 255, g: 255, b: 255 },
  },
})
  .composite([{ input: outPng, blend: "over" }])
  .jpeg({ quality: 92 })
  .toFile(resolve(verifyDir, "story-template-on-white.jpg"));

const meta = await sharp(outPng).metadata();
console.log("meta", meta.width, meta.height, meta.hasAlpha, meta.format);
console.log("Wrote verify composites in assets/source/");

function escapeXml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
