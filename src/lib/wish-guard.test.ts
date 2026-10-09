import { afterEach, describe, expect, it } from "vitest";
import {
  WISH_FORM_MIN_MS,
  WISH_MAX_PER_GUEST,
  checkWishClientGuard,
  getWishCount,
  isSpammyWishMessage,
  markWishSubmitted,
} from "./wish-guard";

afterEach(() => {
  window.localStorage.clear();
});

describe("wish-guard", () => {
  it("tracks per-guest submission count", () => {
    expect(getWishCount("guest-1")).toBe(0);
    markWishSubmitted("guest-1");
    markWishSubmitted("guest-1");
    expect(getWishCount("guest-1")).toBe(2);
    expect(getWishCount("guest-2")).toBe(0);
  });

  it("blocks after max wishes", () => {
    for (let i = 0; i < WISH_MAX_PER_GUEST; i += 1) markWishSubmitted("guest-1");
    const result = checkWishClientGuard(
      "guest-1",
      Date.now() - WISH_FORM_MIN_MS - 1,
      "Semoga bahagia selalu",
    );
    expect(result).toEqual({ allowed: false, reason: "limit_reached" });
  });

  it("rejects too-fast submissions and missing guest", () => {
    expect(checkWishClientGuard(null, Date.now(), "Halo")).toEqual({
      allowed: false,
      reason: "no_guest",
    });
    expect(
      checkWishClientGuard("guest-1", Date.now(), "Semoga bahagia selalu"),
    ).toEqual({ allowed: false, reason: "too_fast" });
  });

  it("flags spammy messages", () => {
    expect(isSpammyWishMessage("https://spam.com")).toBe("link");
    expect(isSpammyWishMessage("hubungi 08123456789")).toBe("phone");
    expect(isSpammyWishMessage("aaaaaaa")).toBe("repeat");
    expect(isSpammyWishMessage("hi")).toBe("too_short");
    expect(isSpammyWishMessage("anjing lu")).toBe("profanity");
    expect(isSpammyWishMessage("Semoga bahagia selalu")).toBeNull();
  });

  it("allows a valid wish", () => {
    const result = checkWishClientGuard(
      "guest-1",
      Date.now() - WISH_FORM_MIN_MS - 1,
      "Semoga bahagia selalu",
    );
    expect(result).toEqual({ allowed: true, remaining: 2 });
  });
});
