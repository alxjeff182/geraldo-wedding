import { describe, expect, it } from "vitest";
import { absoluteUrl } from "./absolute-url";

describe("absoluteUrl", () => {
  it("prefixes relative paths with site URL", () => {
    expect(absoluteUrl("https://geraldo-christin.vercel.app", "/assets/images/cover.jpg")).toBe(
      "https://geraldo-christin.vercel.app/assets/images/cover.jpg",
    );
  });

  it("keeps absolute URLs unchanged", () => {
    expect(absoluteUrl("https://example.com", "https://cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg",
    );
  });

  it("trims trailing slash from base", () => {
    expect(absoluteUrl("https://example.com/", "/og.jpg")).toBe("https://example.com/og.jpg");
  });
});
