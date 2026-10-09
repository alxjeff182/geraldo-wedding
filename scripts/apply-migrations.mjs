#!/usr/bin/env node
/**
 * Print combined SQL for migrations 004–011 to run in Supabase SQL Editor.
 * Usage: node scripts/apply-migrations.mjs > pending-migrations.sql
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "004_guests_invite.sql",
  "005_rsvp_admin.sql",
  "006_admin_hardening.sql",
  "007_rsvp_antispam.sql",
  "008_guest_invite_sent.sql",
  "009_reset_gw5_copy.sql",
  "010_wishes_moderation.sql",
  "011_ensure_guest.sql",
];

console.log("-- Run this file in Supabase SQL Editor (safe to re-run idempotent parts)\n");
console.log("-- Note: 009 resets some CMS copy defaults — review before prod if you customized content.\n");

for (const file of files) {
  const sql = readFileSync(resolve(root, "supabase/migrations", file), "utf8");
  console.log(`-- === ${file} ===`);
  console.log(sql.trim());
  console.log("\n");
}
