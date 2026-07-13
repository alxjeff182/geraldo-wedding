import { test, expect } from "@playwright/test";

test("cover opens invitation", async ({ page }) => {
  await page.goto("/?to=Test+Guest");
  await expect(page.getByRole("button", { name: /buka undangan/i })).toBeVisible();
  await page.getByRole("button", { name: /buka undangan/i }).click();
  await expect(page.getByLabel("Sampul mempelai")).toBeVisible();
});

test("shortcut modal opens and closes", async ({ page }) => {
  await page.goto("/?to=Test+Guest");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  await page.getByRole("button", { name: /buka waktu/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /kembali/i }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("rsvp shortcut shows attendance choices", async ({ page }) => {
  await page.goto("/?to=Test+Guest");
  await page.getByRole("button", { name: /buka undangan/i }).click();
  await page.getByRole("button", { name: /buka rsvp/i }).click();
  await expect(page.getByRole("group", { name: /pilihan kehadiran/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^hadir$/i })).toBeVisible();
});

test("admin login page is publicly accessible", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: /masuk ke cms/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});
