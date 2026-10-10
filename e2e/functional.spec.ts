import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { freezeBrowserTime } from "./helpers/time-freeze";

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
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

const env = { ...process.env, ...loadEnvLocal() };
const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;
const isLiveSupabase = Boolean(
  supabaseUrl &&
    anonKey &&
    !/ci-mock|placeholder|example\.supabase|your-project/i.test(supabaseUrl) &&
    !/ci-mock|placeholder/i.test(anonKey),
);

let submitFunctionDeployed = false;

test.beforeAll(async ({ request }) => {
  if (!isLiveSupabase || !supabaseUrl || !anonKey) return;

  try {
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
      timeout: 8_000,
    });
    submitFunctionDeployed = response.status() !== 404;
  } catch {
    submitFunctionDeployed = false;
  }
});

async function openInvitation(page: import("@playwright/test").Page) {
  await freezeBrowserTime(page, "2026-04-10T12:00:00+07:00");
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/?guest=keluarga-tampubolon");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  const skip = page.getByRole("button", { name: /lewati/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await expect(page.locator("#invitation")).toBeVisible({ timeout: 15000 });
}

test("rsvp form submits to edge function", async ({ page }) => {
  test.skip(!isLiveSupabase, "Live Supabase credentials required (skipped under CI mock URL)");
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
  await page.waitForTimeout(3200);

  const radiogroup = sheet.getByRole("radiogroup", { name: /kehadiran/i });
  if (!(await radiogroup.isVisible().catch(() => false))) {
    test.skip(
      true,
      "Personal guest slug not found — seed keluarga-tampubolon or open mocked invitation.spec",
    );
  }

  await sheet.getByLabel(/nama/i).fill("Functional Test");

  const submitResponse = page.waitForResponse(
    (resp) => resp.url().includes("/functions/v1/submit") && resp.request().method() === "POST",
    { timeout: 15_000 },
  );
  await page.getByRole("button", { name: /kirim konfirmasi/i }).click();
  const response = await submitResponse;
  expect(response.status(), "Edge function submit should return 200").toBe(200);
});

test("guestbook form submits to edge function", async ({ page }) => {
  test.skip(!isLiveSupabase, "Live Supabase credentials required (skipped under CI mock URL)");
  test.skip(
    !submitFunctionDeployed,
    "Deploy edge function: npx supabase functions deploy submit --project-ref zuuwxxrpkbfmelyoibst",
  );

  await openInvitation(page);

  const guestbook = page.locator("#wishes");
  await guestbook.scrollIntoViewIfNeeded();
  const chip = guestbook.locator(".wishes-namechip");
  if (!(await chip.isVisible().catch(() => false))) {
    test.skip(true, "Personal guest slug not found — seed guest for ?guest=keluarga-tampubolon");
  }
  await guestbook.getByPlaceholder(/ucapan|doa/i).fill("Selamat menempuh hidup baru!");

  await page.waitForTimeout(3200);

  const submitResponse = page.waitForResponse(
    (resp) => resp.url().includes("/functions/v1/submit") && resp.request().method() === "POST",
    { timeout: 15_000 },
  );
  await guestbook.getByRole("button", { name: /kirim/i }).click();
  const response = await submitResponse;
  expect(response.status(), "Edge function submit should return 200").toBe(200);
});

test("gift section shows bank details", async ({ page }) => {
  const { mockSupabaseMinimal, mockSupabaseGuest } = await import("./helpers/supabase-mock");
  await freezeBrowserTime(page, "2026-04-10T12:00:00+07:00");
  await mockSupabaseMinimal(page);
  await mockSupabaseGuest(page, "keluarga-tampubolon", {
    id: "11111111-1111-4111-8111-111111111111",
    display_name: "Keluarga Tampubolon",
  });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/?guest=keluarga-tampubolon");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  const skip = page.getByRole("button", { name: /lewati/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await expect(page.locator("#invitation")).toBeVisible({ timeout: 15000 });

  const gift = page.locator("#gift");
  await gift.scrollIntoViewIfNeeded();
  await gift.getByRole("tab", { name: /transfer bank/i }).click();
  await expect(gift.getByText(/bca/i)).toBeVisible();
  await expect(gift.getByRole("button", { name: /salin/i }).first()).toBeVisible();
});
