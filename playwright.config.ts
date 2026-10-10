import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

function loadEnvLocal(): Record<string, string> {
  const envPath = resolve(import.meta.dirname, ".env.local");
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

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "iphone-se", use: { ...devices["iPhone SE"] } },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: false,
    env: (() => {
      const local = loadEnvLocal();
      const pick = (key: string, fallback: string) =>
        local[key]?.trim() || process.env[key]?.trim() || fallback;
      // E2E always uses a mockable host (never CI placeholders — those disable the client).
      const e2eSupabaseUrl = process.env.CI
        ? "https://ci-mock.supabase.co"
        : pick("VITE_SUPABASE_URL", "https://ci-mock.supabase.co");
      const e2eSupabaseKey = process.env.CI
        ? "ci-mock-anon-key"
        : pick("VITE_SUPABASE_ANON_KEY", "ci-mock-anon-key");
      return {
        ...process.env,
        ...local,
        VITE_SITE_URL: pick("VITE_SITE_URL", "http://localhost:5173"),
        VITE_SUPABASE_URL: e2eSupabaseUrl,
        VITE_SUPABASE_ANON_KEY: e2eSupabaseKey,
      };
    })(),
  },
});
