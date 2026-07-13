import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal(): Record<string, string> {
  const envPath = resolve(import.meta.dirname, "..", ".env.local");
  if (!existsSync(envPath)) return {};

  const env: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

const env = { ...process.env, ...loadEnvLocal() };
const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

let submitFunctionDeployed = false;

test.beforeAll(async ({ request }) => {
  if (!supabaseUrl || !anonKey) return;

  const response = await request.post(`${supabaseUrl}/functions/v1/submit`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    data: { type: "rsvp", honeypot: "", formOpenedAt: Date.now() - 5000, payload: { name: "probe", guest_count: 1, attendance: "hadir" } },
    failOnStatusCode: false,
  });

  submitFunctionDeployed = response.status() !== 404;
});

async function openInvitation(page: import("@playwright/test").Page) {
  await page.goto("/?to=Functional+Test");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  await expect(page.getByLabel("Sampul mempelai")).toBeVisible();
  await page.getByRole("button", { name: /buka waktu/i }).waitFor({ timeout: 15_000 });
}

test("rsvp form submits to edge function", async ({ page }) => {
  test.skip(
    !submitFunctionDeployed,
    "Deploy edge function: npx supabase functions deploy submit --project-ref zuuwxxrpkbfmelyoibst",
  );

  await openInvitation(page);

  const rsvp = page.getByRole("region", { name: /^rsvp$/i });
  await rsvp.scrollIntoViewIfNeeded();

  await rsvp.getByRole("textbox", { name: /^nama/i }).fill("Functional Test");
  await rsvp.getByRole("combobox", { name: /konfirmasi kehadiran/i }).selectOption("hadir");
  await rsvp.getByRole("combobox", { name: /jumlah kehadiran/i }).selectOption("1");

  const [submitRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes("/functions/v1/submit"), { timeout: 15_000 }),
    rsvp.getByRole("button", { name: /^submit$/i }).click(),
  ]);

  const response = await submitRequest.response();
  expect(response?.status(), "Edge function submit should return 200").toBe(200);
});

test("guestbook form submits to edge function", async ({ page }) => {
  test.skip(
    !submitFunctionDeployed,
    "Deploy edge function: npx supabase functions deploy submit --project-ref zuuwxxrpkbfmelyoibst",
  );

  await openInvitation(page);

  const guestbook = page.getByRole("region", { name: /best wishes/i });
  await guestbook.scrollIntoViewIfNeeded();
  await guestbook.getByPlaceholder(/nama/i).fill("Functional Tester");
  await guestbook.getByPlaceholder(/ucapan/i).fill("Selamat menempuh hidup baru!");

  const [submitRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes("/functions/v1/submit"), { timeout: 15_000 }),
    guestbook.getByRole("button", { name: /kirim/i }).click(),
  ]);

  const response = await submitRequest.response();
  expect(response?.status(), "Edge function submit should return 200").toBe(200);
});

test("gift section expands with bank details", async ({ page }) => {
  await openInvitation(page);

  const gift = page.getByRole("region", { name: /wedding gift/i });
  await gift.scrollIntoViewIfNeeded();
  await gift.getByRole("button", { name: /klik di sini/i }).click();

  await expect(gift.getByText(/bank bca/i)).toBeVisible();
  await expect(gift.getByRole("button", { name: /salin nomor rekening/i })).toBeVisible();
});
