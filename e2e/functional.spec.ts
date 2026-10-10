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
    data: {
      type: "rsvp",
      honeypot: "",
      formOpenedAt: Date.now() - 5000,
      payload: { name: "probe", guest_count: 1, attendance: "hadir" },
    },
    failOnStatusCode: false,
  });

  submitFunctionDeployed = response.status() !== 404;
});

async function openInvitation(page: import("@playwright/test").Page) {
  await page.goto("/?guest=keluarga-tampubolon");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  const skip = page.getByRole("button", { name: /lewati/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await expect(page.locator("#invitation")).toBeVisible({ timeout: 15000 });
}

test("rsvp form submits to edge function", async ({ page }) => {
  test.skip(
    !submitFunctionDeployed,
    "Deploy edge function: npx supabase functions deploy submit --project-ref zuuwxxrpkbfmelyoibst",
  );

  await openInvitation(page);
  await page.locator("#invitation").evaluate((el) => {
    (el as HTMLElement).scrollTop = 400;
  });

  await page.getByRole("button", { name: /rsvp/i }).first().click();
  const sheet = page.locator("#sheet-rsvp");
  await expect(sheet).toBeVisible();

  await sheet.getByPlaceholder(/nama/i).fill("Functional Test");

  const [submitRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes("/functions/v1/submit"), { timeout: 15_000 }),
    sheet.locator('button[type="submit"]').click(),
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

  const guestbook = page.locator("#wishes");
  await guestbook.scrollIntoViewIfNeeded();
  await expect(guestbook.locator(".wishes-namechip")).toBeVisible();
  await guestbook.getByPlaceholder(/ucapan|doa/i).fill("Selamat menempuh hidup baru!");

  // Wait past client anti-spam min form time
  await page.waitForTimeout(3200);

  const [submitRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes("/functions/v1/submit"), { timeout: 15_000 }),
    guestbook.getByRole("button", { name: /kirim/i }).click(),
  ]);

  const response = await submitRequest.response();
  expect(response?.status(), "Edge function submit should return 200").toBe(200);
});

test("gift section shows bank details", async ({ page }) => {
  await openInvitation(page);

  const gift = page.locator("#gift");
  await gift.scrollIntoViewIfNeeded();
  await expect(gift.getByText(/bca/i)).toBeVisible();
  await expect(gift.getByRole("button", { name: /salin/i }).first()).toBeVisible();
});
