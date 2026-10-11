#!/usr/bin/env node
/**
 * OG / WhatsApp share card — portrait full-body opening photo.
 * Text (THE WEDDING OF → date) sits at the TOP.
 * Output: public/assets/ballroom/og-wa-v5.jpg (1080×1920)
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcPhoto = resolve(root, "public/assets/ballroom/cover-frame.jpg");
const outPath = resolve(root, "public/assets/ballroom/og-wa-v5.jpg");

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

const overlaySvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0605" stop-opacity="0.72"/>
      <stop offset="70%" stop-color="#0a0605" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0a0605" stop-opacity="0"/>
    </linearGradient>
    <style>
      @font-face {
        font-family: "OgSerif";
        src: url("${fontUri}");
      }
    </style>
  </defs>
  <rect width="${W}" height="420" fill="url(#topFade)"/>
  <text
    x="50%" y="110"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="28"
    letter-spacing="0.32em"
    fill="#d4af37"
  >THE WEDDING OF</text>
  <text
    x="50%" y="200"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="72"
    font-weight="600"
    fill="#f7f1e8"
  >Geraldo &amp; Christin</text>
  <line
    x1="420" y1="240" x2="660" y2="240"
    stroke="#d4af37" stroke-width="2" stroke-opacity="0.8"
  />
  <text
    x="50%" y="300"
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
