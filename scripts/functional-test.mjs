#!/usr/bin/env node
/**
 * Live functional tests against production Supabase + site.
 * Usage: node scripts/functional-test.mjs
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

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = (process.env.VITE_SITE_URL ?? "https://geraldo-christin.vercel.app").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, anonKey);
const admin = serviceKey ? createClient(url, serviceKey) : null;

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function invokeSubmit(body) {
  const { data, error } = await supabase.functions.invoke("submit", {
    body,
    headers: { Origin: siteUrl },
  });
  return { data, error, status: error?.context?.status };
}

const stamp = Date.now();

// 1. CMS content
{
  const { data, error } = await supabase
    .from("site_content")
    .select("id")
    .eq("id", "main")
    .maybeSingle();
  if (!error && data) pass("CMS site_content readable");
  else if (!error && !data) pass("CMS site_content readable", "empty — using default config");
  else fail("CMS site_content readable", error?.message ?? "no row");
}

// 2. Guest lookup RPC
{
  const { data, error } = await supabase.rpc("get_guest_by_slug", { guest_slug: "nonexistent-slug-xyz" });
  if (!error && Array.isArray(data)) pass("RPC get_guest_by_slug", `returns ${data.length} row(s)`);
  else fail("RPC get_guest_by_slug", error.message);
}

// 3. RSVP submit
{
  const { data, error } = await invokeSubmit({
    type: "rsvp",
    honeypot: "",
    formOpenedAt: Date.now() - 5000,
    payload: {
      guest_id: null,
      name: `QA RSVP ${stamp}`,
      guest_count: 2,
      attendance: "hadir",
    },
  });
  if (!error && data?.ok) pass("Edge submit RSVP", `QA RSVP ${stamp}`);
  else if (error?.message?.includes("non-2xx")) fail("Edge submit RSVP", "function not deployed? run: npx supabase functions deploy submit");
  else fail("Edge submit RSVP", error?.message ?? JSON.stringify(data));
}

// 4. Wish submit
{
  const { data, error } = await invokeSubmit({
    type: "wish",
    honeypot: "",
    payload: {
      guest_id: null,
      name: `QA Wish ${stamp}`,
      message: "Functional test ucapan — selamat menempuh hidup baru!",
    },
  });
  if (!error && data?.ok) pass("Edge submit wish", `QA Wish ${stamp}`);
  else fail("Edge submit wish", error?.message ?? JSON.stringify(data));
}

// 5. Honeypot silently accepts
{
  const { data, error } = await invokeSubmit({
    type: "rsvp",
    honeypot: "bot",
    payload: { name: "bot", guest_count: 1, attendance: "hadir" },
  });
  if (!error && data?.ok) pass("Honeypot blocks silently");
  else fail("Honeypot blocks silently", error?.message ?? JSON.stringify(data));
}

// 6. Invalid RSVP rejected
{
  const { data, error } = await invokeSubmit({
    type: "rsvp",
    honeypot: "",
    formOpenedAt: Date.now() - 5000,
    payload: { name: "", guest_count: 1, attendance: "hadir" },
  });
  if (error || data?.error) pass("Invalid RSVP rejected");
  else fail("Invalid RSVP rejected", "expected error");
}

// 7. Wishes visible publicly
{
  const { data, error } = await supabase
    .from("wishes")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(5);
  if (!error && Array.isArray(data)) {
    const found = data.some((w) => w.name === `QA Wish ${stamp}`);
    pass("Wishes readable", found ? "new wish visible" : `${data.length} wishes in DB`);
  } else fail("Wishes readable", error?.message);
}

// 8. Admin allowlist (needs service role)
if (admin) {
  const { error } = await admin.from("admin_allowlist").select("email").limit(1);
  if (!error) pass("Migration 006 admin_allowlist");
  else fail("Migration 006 admin_allowlist", error.message);

  const { error: rsvpErr } = await admin.from("rsvp_submissions").select("id, name").limit(5);
  if (!rsvpErr) {
    const { data } = await admin
      .from("rsvp_submissions")
      .select("name")
      .eq("name", `QA RSVP ${stamp}`)
      .maybeSingle();
    pass("Migration 005 RSVP admin", data ? "test RSVP found" : "table readable");
  } else fail("Migration 005 RSVP admin", rsvpErr.message);

  const { error: guestErr } = await admin.from("guests").select("phone").limit(1);
  if (!guestErr) pass("Migration 004 guests.phone");
  else fail("Migration 004 guests.phone", guestErr.message);
} else {
  console.log("⊘ Skipping admin/migration checks (no SUPABASE_SERVICE_ROLE_KEY)");
}

// 9. Public site reachable
{
  const res = await fetch(siteUrl, { redirect: "follow" });
  if (res.ok) pass("Production site HTTP", `${res.status} ${siteUrl}`);
  else fail("Production site HTTP", `${res.status}`);
}

{
  const res = await fetch(`${siteUrl}/admin`, { redirect: "follow" });
  if (res.ok) pass("Admin page HTTP", `${res.status}`);
  else fail("Admin page HTTP", `${res.status}`);
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
