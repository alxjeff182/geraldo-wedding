import type { Page } from "@playwright/test";

export async function mockSupabaseGuest(
  page: Page,
  slug: string,
  guest: { id: string; display_name: string },
) {
  await page.route(/get_guest_by_slug/i, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    let body: { guest_slug?: string } = {};
    try {
      body = route.request().postDataJSON() as { guest_slug?: string };
    } catch {
      body = {};
    }
    if (body?.guest_slug === slug) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([guest]),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
}

export async function mockSupabasePublicReads(page: Page) {
  await page.route(/\/rest\/v1\/site_content/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/rest\/v1\/wishes/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}

export async function mockSupabaseMinimal(page: Page) {
  await mockSupabasePublicReads(page);
  await page.route(/\/functions\/v1\/submit$/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}
