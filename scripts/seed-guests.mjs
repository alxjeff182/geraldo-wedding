#!/usr/bin/env node
/**
 * Seed guests from CSV: slug,display_name,phone
 * Usage: node scripts/seed-guests.mjs guests.csv
 *
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/seed-guests.mjs <guests.csv>");
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);
const csv = readFileSync(file, "utf8");
const rows = csv
  .trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const [slug, display_name, phone = ""] = line.split(",").map((s) => s.trim());
    return {
      slug,
      display_name,
      phone: phone || null,
    };
  })
  .filter((r) => r.slug && r.display_name);

const { data, error } = await supabase.from("guests").upsert(rows, { onConflict: "slug" }).select();
if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Seeded ${data?.length ?? 0} guests`);
