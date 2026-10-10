import { describe, expect, it } from "vitest";
import { hashtagExploreUrl } from "./hashtag-url";

describe("hashtagExploreUrl", () => {
  it("builds Instagram explore tag URL without leading hash", () => {
    expect(hashtagExploreUrl("#GeraldoChristin")).toBe(
      "https://www.instagram.com/explore/tags/GeraldoChristin/",
    );
    expect(hashtagExploreUrl("GeraldoChristin")).toBe(
      "https://www.instagram.com/explore/tags/GeraldoChristin/",
    );
  });
});
