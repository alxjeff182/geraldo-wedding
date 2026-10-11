#!/usr/bin/env node
/**
 * OG / WhatsApp share card — full-bleed opening photo, text at TOP.
 * Output: public/assets/ballroom/og-wa-v4.jpg (1200×630)
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcPhoto = resolve(root, "public/assets/ballroom/cover-frame.jpg");
const outPath = resolve(root, "public/assets/ballroom/og-wa-v4.jpg");

const W = 1200;
const H = 630;

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

// Cover-crop portrait → landscape around the couple (not just the door top).
const srcMeta = await sharp(srcPhoto).rotate().metadata();
const srcW = srcMeta.width ?? 720;
const srcH = srcMeta.height ?? 1280;
const cropH = Math.round((srcW * H) / W);
// Faces sit mid-frame; keep a little door above for the top text band.
const cropTop = Math.max(0, Math.min(srcH - cropH, Math.round((srcH - cropH) * 0.28)));

const photo = await sharp(srcPhoto)
  .rotate()
  .extract({ left: 0, top: cropTop, width: srcW, height: cropH })
  .resize(W, H, { kernel: "lanczos3" })
  .toBuffer();

const overlaySvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0605" stop-opacity="0.78"/>
      <stop offset="55%" stop-color="#0a0605" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0a0605" stop-opacity="0"/>
    </linearGradient>
    <style>
      @font-face {
        font-family: "OgSerif";
        src: url("${fontUri}");
      }
    </style>
  </defs>
  <rect width="${W}" height="280" fill="url(#topFade)"/>
  <text
    x="50%" y="72"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="22"
    letter-spacing="0.28em"
    fill="#d4af37"
  >THE WEDDING OF</text>
  <text
    x="50%" y="138"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="58"
    font-weight="600"
    fill="#f7f1e8"
  >Geraldo &amp; Christin</text>
  <line
    x1="480" y1="168" x2="720" y2="168"
    stroke="#d4af37" stroke-width="1.5" stroke-opacity="0.75"
  />
  <text
    x="50%" y="210"
    text-anchor="middle"
    font-family="OgSerif, Georgia, serif"
    font-size="28"
    letter-spacing="0.18em"
    fill="#e8dcc8"
  >24 . 10 . 2026</text>
</svg>`);

await sharp(photo)
  .composite([{ input: overlaySvg, top: 0, left: 0 }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`Wrote ${outPath} (${meta.width}×${meta.height})`);
