#!/usr/bin/env node
/**
 * Generates the default IG Story template (1080×1920) for Share Your Moments.
 * Replace later via CMS upload.
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outPng = resolve(root, "public/assets/ballroom/story-template.png");
const outWebp = resolve(root, "public/assets/ballroom/story-template.webp");

const W = 1080;
const H = 1920;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a0f0c"/>
      <stop offset="45%" stop-color="#241612"/>
      <stop offset="100%" stop-color="#120c0a"/>
    </linearGradient>
    <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4af70"/>
      <stop offset="50%" stop-color="#f0d9a8"/>
      <stop offset="100%" stop-color="#b8924a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="28%" r="42%">
      <stop offset="0%" stop-color="#d4af70" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#d4af70" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Outer gold frame -->
  <rect x="48" y="48" width="984" height="1824" rx="28" fill="none" stroke="url(#frame)" stroke-width="2" opacity="0.7"/>
  <rect x="68" y="68" width="944" height="1784" rx="20" fill="none" stroke="#d4af70" stroke-width="1" opacity="0.28"/>

  <!-- Top monogram -->
  <text x="540" y="180" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" letter-spacing="10" fill="#d4af70" opacity="0.9">G &amp; C</text>
  <line x1="360" y1="210" x2="720" y2="210" stroke="#d4af70" stroke-width="1" opacity="0.35"/>

  <!-- Photo placeholder (guest can sticker over) -->
  <rect x="180" y="280" width="720" height="900" rx="18" fill="#2a1c17" stroke="#d4af70" stroke-width="1.5" stroke-dasharray="14 10" opacity="0.85"/>
  <circle cx="540" cy="680" r="54" fill="none" stroke="#d4af70" stroke-width="1.5" opacity="0.45"/>
  <path d="M540 648 v64 M508 680 h64" stroke="#d4af70" stroke-width="1.5" opacity="0.45"/>
  <text x="540" y="820" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="28" letter-spacing="4" fill="#f0d9a8" opacity="0.55">FOTO KAMU</text>
  <text x="540" y="860" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="2" fill="#cbb9a8" opacity="0.4">Tambahkan foto di Story</text>

  <!-- Names -->
  <text x="540" y="1320" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="56" fill="#f5ebe0">Geraldo</text>
  <text x="540" y="1385" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="28" letter-spacing="8" fill="#d4af70">&amp;</text>
  <text x="540" y="1455" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="56" fill="#f5ebe0">Christin</text>

  <!-- Date -->
  <line x1="380" y1="1510" x2="700" y2="1510" stroke="#d4af70" stroke-width="1" opacity="0.35"/>
  <text x="540" y="1570" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="6" fill="#d4af70">24 · 10 · 2026</text>

  <!-- Hashtag -->
  <text x="540" y="1720" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="2" fill="#f0d9a8">#GeraldoChristin2026</text>
  <text x="540" y="1780" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" letter-spacing="3" fill="#cbb9a8" opacity="0.55">SHARE YOUR MOMENT</text>
</svg>`;

const buf = Buffer.from(svg);
await sharp(buf).png({ compressionLevel: 9 }).toFile(outPng);
await sharp(buf).webp({ quality: 88 }).toFile(outWebp);
console.log("Wrote", outPng);
console.log("Wrote", outWebp);
