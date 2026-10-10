import { expect, test } from "@playwright/test";
import { mockSupabaseGuest, mockSupabaseMinimal } from "./helpers/supabase-mock";
import { freezeBrowserTime } from "./helpers/time-freeze";

test.describe("ballroom theme smoke", () => {
  test("cover personalization and sheets", async ({ page }) => {
    await freezeBrowserTime(page, "2026-04-10T12:00:00+07:00");
    await mockSupabaseMinimal(page);
    await mockSupabaseGuest(page, "keluarga-tampubolon", {
      id: "11111111-1111-4111-8111-111111111111",
      display_name: "Keluarga Tampubolon",
    });
    await page.goto("/?guest=keluarga-tampubolon");
    await expect(page.getByText("Kepada Yth.")).toBeVisible({ timeout: 20000 });
    await expect(page.locator(".cover__guest-name")).toHaveText(/Keluarga Tampubolon/i);

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

    await page
      .getByRole("button", { name: /lokasi|open maps|events/i })
      .first()
      .click();
    await expect(page.locator("#sheet-location")).toBeVisible();
  });
});
