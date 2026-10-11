#!/usr/bin/env node
/**
 * OG / WhatsApp share card — portrait full-body opening photo.
 * Text sits below WA's top crop safe-zone (~18% from top).
 * Output: public/assets/ballroom/og-wa-v6.jpg (1080×1920)
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcPhoto = resolve(root, "public/assets/ballroom/cover-frame.jpg");
const outPath = resolve(root, "public/assets/ballroom/og-wa-v6.jpg");

const W = 1080;
const H = 1920;

const FONT_CANDIDATES = [
  "/System/Library/Fonts/Supplemental/Georgia.ttf",
  "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
  "/Library/Fonts/Georgia.ttf",
];

const fontfile = FONT_CANDIDATES.find((p) => existsSync(p));
if (!fontfile) {
  console.error("No serif TTF found.");
  process.exit(1);
}
if (!existsSync(srcPhoto)) {
  console.error("Missing photo:", srcPhoto);
  process.exit(1);
}

const fontUri = `file://${fontfile}`;

const photo = await sharp(srcPhoto)
  .rotate()
  .resize(W, H, { fit: "cover", position: "centre", kernel: "lanczos3" })
  .toBuffer();

// WA crops ~top 15% of tall previews — keep copy below that band.
const overlaySvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0605" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#0a0605" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0a0605" stop-opacity="0"/>
    </linearGradient>
    <style>
      @font-face {
        font-family: "OgSerif";
        src: url("${fontUri}");
      }
    </style>
  </defs>
  <rect x="0" y="280" width="${W}" height="400" fill="url(#topFade)"/>
  <text
    x="50%" y="400"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="28"
    letter-spacing="0.32em"
    fill="#d4af37"
  >THE WEDDING OF</text>
  <text
    x="50%" y="490"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="68"
    font-weight="600"
    fill="#f7f1e8"
  >Geraldo &amp; Christin</text>
  <line
    x1="420" y1="530" x2="660" y2="530"
    stroke="#d4af37" stroke-width="2" stroke-opacity="0.8"
  />
  <text
    x="50%" y="590"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="34"
    letter-spacing="0.2em"
    fill="#e8dcc8"
  >24 . 10 . 2026</text>
</svg>`);

await sharp(photo)
  .composite([{ input: overlaySvg, top: 0, left: 0 }])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`Wrote ${outPath} (${meta.width}×${meta.height})`);
