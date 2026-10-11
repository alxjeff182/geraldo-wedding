import { describe, expect, it } from "vitest";
import { wedding, type WeddingConfig } from "../config/wedding.config";
import { buildOgImageAlt, buildSeoTitle } from "./usePageMeta";

describe("buildSeoTitle", () => {
  it("puts brand first with hero eyebrow", () => {
    expect(buildSeoTitle(wedding)).toBe("The Wedding Of · Geraldo & Christin");
  });

  it("falls back to brand when eyebrow empty", () => {
    const content = {
      ...wedding,
      hero: { ...wedding.hero, eyebrow: "" },
    } as unknown as WeddingConfig;
    expect(buildSeoTitle(content)).toBe("Geraldo & Christin");
  });
});

describe("buildOgImageAlt", () => {
  it("echoes brand, eyebrow, and short date", () => {
    expect(buildOgImageAlt(wedding)).toBe("The Wedding Of · Geraldo & Christin — 24 . 10 . 2026");
  });
});
