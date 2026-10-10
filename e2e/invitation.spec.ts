import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockSupabaseGuest, mockSupabaseMinimal } from "./helpers/supabase-mock";
import { freezeBrowserTime } from "./helpers/time-freeze";

async function openInvitation(
  page: import("@playwright/test").Page,
  path = "/?guest=keluarga-tampubolon",
) {
  await freezeBrowserTime(page, "2026-04-10T12:00:00+07:00");
  await mockSupabaseMinimal(page);
  await mockSupabaseGuest(page, "keluarga-tampubolon", {
    id: "11111111-1111-4111-8111-111111111111",
    display_name: "Keluarga Tampubolon",
  });
  await page.goto(path);
  await expect(page.getByRole("button", { name: /buka undangan/i })).toBeVisible({
    timeout: 20000,
  });
  await page.getByRole("button", { name: /buka undangan/i }).click();
  const skip = page.getByRole("button", { name: /lewati/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await expect(page.locator("#invitation")).toBeVisible({ timeout: 15000 });
}

test("cover opens invitation", async ({ page }) => {
  await openInvitation(page);
  await expect(page.locator("#hero")).toBeVisible();
});

test("main page passes axe accessibility scan", async ({ page }) => {
  await openInvitation(page);
  const results = await new AxeBuilder({ page })
    .disableRules([
      "page-has-heading-one",
      "aria-allowed-role",
      "nested-interactive",
      "aria-hidden-focus",
      "aria-required-children",
    ])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(blocking).toEqual([]);
});

test("rsvp sheet opens from dock", async ({ page }) => {
  await openInvitation(page);
  await page.locator("#invitation").evaluate((el) => {
    (el as HTMLElement).scrollTop = 400;
  });
  const rsvpBtn = page.getByRole("button", { name: /rsvp/i }).first();
  await expect(rsvpBtn).toBeVisible({ timeout: 10000 });
  await rsvpBtn.click();
  await expect(page.locator("#sheet-rsvp")).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: /kehadiran/i })).toBeVisible();
});

test("public link locks RSVP without personal guest", async ({ page }) => {
  await freezeBrowserTime(page, "2026-04-10T12:00:00+07:00");
  await mockSupabaseMinimal(page);
  await page.goto("/");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  const skip = page.getByRole("button", { name: /lewati/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await expect(page.locator("#invitation")).toBeVisible({ timeout: 15000 });
  await page.locator("#invitation").evaluate((el) => {
    (el as HTMLElement).scrollTop = 400;
  });
  await page.getByRole("button", { name: /rsvp/i }).first().click();
  await expect(page.locator("#sheet-rsvp")).toBeVisible();
  await expect(page.locator("#sheet-rsvp .wishes-locked")).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: /kehadiran/i })).toHaveCount(0);
});

test("personal guest unlocks RSVP with mocked slug lookup", async ({ page }) => {
  await freezeBrowserTime(page, "2026-04-10T12:00:00+07:00");
  await mockSupabaseMinimal(page);
  await mockSupabaseGuest(page, "jeffry-istri", {
    id: "22222222-2222-4222-8222-222222222222",
    display_name: "Jeffry & Istri",
  });
  await page.goto("/?guest=jeffry-istri");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  const skip = page.getByRole("button", { name: /lewati/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await expect(page.locator("#invitation")).toBeVisible({ timeout: 15000 });
  await page.locator("#invitation").evaluate((el) => {
    (el as HTMLElement).scrollTop = 400;
  });
  await page.getByRole("button", { name: /rsvp/i }).first().click();
  await expect(page.getByRole("radiogroup", { name: /kehadiran/i })).toBeVisible();
});

test("admin login page is publicly accessible", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: /masuk ke cms/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});
