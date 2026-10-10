#!/usr/bin/env node
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logo = resolve(root, "public/assets/ballroom/logo.png");
const outDir = resolve(root, "public");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512, maskable: true },
  { name: "apple-touch-icon-180.png", size: 180 },
];

for (const spec of sizes) {
  let pipeline = sharp(logo).resize(spec.size, spec.size, {
    fit: "contain",
    background: { r: 26, g: 15, b: 12, alpha: 1 },
  });

  if (spec.maskable) {
    const pad = Math.round(spec.size * 0.1);
    pipeline = sharp(logo)
      .resize(spec.size - pad * 2, spec.size - pad * 2, {
        fit: "contain",
        background: { r: 26, g: 15, b: 12, alpha: 1 },
      })
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 26, g: 15, b: 12, alpha: 1 },
      });
  }

  const dest = resolve(outDir, spec.name);
  await pipeline.png().toFile(dest);
  console.log("Wrote", spec.name);
}
