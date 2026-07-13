#!/usr/bin/env node
/**
 * Verify production Supabase migrations 004–007.
 * Requires: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL (or VITE_SUPABASE_URL in .env.local) and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const checks = [
  {
    name: "004 guests.phone column",
    run: async () => {
      const { error } = await supabase.from("guests").select("phone").limit(1);
      return !error;
    },
  },
  {
    name: "005 rsvp admin readable",
    run: async () => {
      const { error } = await supabase.from("rsvp_submissions").select("id").limit(1);
      return !error;
    },
  },
  {
    name: "006 admin_allowlist table",
    run: async () => {
      const { error } = await supabase.from("admin_allowlist").select("email").limit(1);
      return !error;
    },
  },
  {
    name: "006 is_admin() RPC",
    run: async () => {
      const { error } = await supabase.rpc("is_admin");
      return !error;
    },
  },
  {
    name: "007 rsvp one-per-guest index",
    run: async () => {
      const { data, error } = await supabase
        .from("rsvp_submissions")
        .select("guest_id")
        .not("guest_id", "is", null)
        .limit(1);
      return !error && Array.isArray(data);
    },
  },
];

let failed = 0;

console.log(`Checking Supabase at ${url}\n`);

for (const check of checks) {
  const ok = await check.run();
  console.log(`${ok ? "✓" : "✗"} ${check.name}`);
  if (!ok) failed += 1;
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed. Run: npm run db:apply > pending-migrations.sql`);
  console.error("Then paste into Supabase SQL Editor for project geraldo-wedding.");
  process.exit(1);
}

console.log("\nAll migration checks passed.");
