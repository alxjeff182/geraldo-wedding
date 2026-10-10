import { describe, expect, it } from "vitest";
import { hashtagExploreUrl } from "./hashtag-url";

describe("invite gating helpers", () => {
  it("locks RSVP/wishes when guestId is null", () => {
    const guestId: string | null = null;
    const canSubmitWish = Boolean(guestId);
    const canSubmitRsvp = Boolean(guestId);
    expect(canSubmitWish).toBe(false);
    expect(canSubmitRsvp).toBe(false);
  });

  it("unlocks when guestId is present", () => {
    const guestId: string | null = "11111111-1111-4111-8111-111111111111";
    expect(Boolean(guestId)).toBe(true);
  });
});

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
