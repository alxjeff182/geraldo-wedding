import { test, expect } from "@playwright/test";

async function openInvitation(page: import("@playwright/test").Page) {
  await page.goto("/?guest=test-guest");
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

test("admin login page is publicly accessible", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: /masuk ke cms/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});
