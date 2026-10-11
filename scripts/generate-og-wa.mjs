#!/usr/bin/env node
/**
 * OG / WhatsApp share card — portrait full-body opening photo.
 * Text only (no dark band). Placed in WA-safe zone above heads.
 * Output: public/assets/ballroom/og-wa-v7.jpg (1080×1920)
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcPhoto = resolve(root, "public/assets/ballroom/cover-frame.jpg");
const outPath = resolve(root, "public/assets/ballroom/og-wa-v7.jpg");

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
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <style>
      @font-face {
        font-family: "OgSerif";
        src: url("${fontUri}");
      }
    </style>
  </defs>
  <g filter="url(#softShadow)" text-anchor="middle" font-family="OgSerif, Georgia, serif">
    <text
      x="50%" y="400"
      font-size="28"
      letter-spacing="0.32em"
      fill="#d4af37"
    >THE WEDDING OF</text>
    <text
      x="50%" y="490"
      font-size="68"
      font-weight="600"
      fill="#f7f1e8"
    >Geraldo &amp; Christin</text>
    <line
      x1="420" y1="530" x2="660" y2="530"
      stroke="#d4af37" stroke-width="2" stroke-opacity="0.9"
    />
    <text
      x="50%" y="590"
      font-size="34"
      letter-spacing="0.2em"
      fill="#f0e6d4"
    >24 . 10 . 2026</text>
  </g>
</svg>`);

await sharp(photo)
  .composite([{ input: overlaySvg, top: 0, left: 0 }])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`Wrote ${outPath} (${meta.width}×${meta.height})`);
