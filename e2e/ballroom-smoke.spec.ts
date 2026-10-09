import { expect, test } from "@playwright/test";

test.describe("ballroom theme smoke", () => {
  test("cover personalization and sheets", async ({ page }) => {
    await page.goto("/?guest=keluarga-tampubolon");
    await expect(page.getByText("Kepada Yth.")).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Keluarga Tampubolon/i)).toBeVisible();

    await page.getByRole("button", { name: /buka undangan/i }).click();
    const skip = page.getByRole("button", { name: /lewati/i });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }

    await expect(page.locator("#invitation")).toBeVisible({ timeout: 15000 });

    // Open dock actions after scrolling a bit into hero
    await page.locator("#invitation").evaluate((el) => {
      (el as HTMLElement).scrollTop = 400;
    });

    const rsvpBtn = page.getByRole("button", { name: /rsvp/i }).first();
    await expect(rsvpBtn).toBeVisible({ timeout: 10000 });
    await rsvpBtn.click();
    await expect(page.locator("#sheet-rsvp")).toBeVisible();
    await page.locator('#sheet-rsvp [aria-label="Tutup"]').click();

    await page.getByRole("button", { name: /lokasi|open maps|events/i }).first().click();
    await expect(page.locator("#sheet-location")).toBeVisible();
  });
});
