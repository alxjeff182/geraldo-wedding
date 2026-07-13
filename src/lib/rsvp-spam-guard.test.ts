import { afterEach, describe, expect, it } from "vitest";
import {
  RSVP_CLIENT_COOLDOWN_MS,
  RSVP_FORM_MIN_MS,
  checkRsvpClientGuard,
  hasRsvpSubmitted,
  isSpammyRsvpName,
  markRsvpSubmitted,
} from "./rsvp-spam-guard";

afterEach(() => {
  window.localStorage.clear();
});

describe("rsvp-spam-guard", () => {
  it("blocks repeat submission within cooldown window", () => {
    markRsvpSubmitted("guest-1");
    expect(hasRsvpSubmitted("guest-1")).toBe(true);
    expect(hasRsvpSubmitted("guest-2")).toBe(false);
  });

  it("allows resubmit after cooldown expires", () => {
    markRsvpSubmitted(null);
    window.localStorage.setItem("gw-rsvp-submitted:anon", String(Date.now() - RSVP_CLIENT_COOLDOWN_MS - 1));
    expect(hasRsvpSubmitted(null)).toBe(false);
  });

  it("rejects submissions that are too fast", () => {
    const openedAt = Date.now();
    const result = checkRsvpClientGuard(null, openedAt, "Budi Santoso");
    expect(result).toEqual({ allowed: false, reason: "too_fast" });
  });

  it("allows submissions after minimum form time", () => {
    const openedAt = Date.now() - RSVP_FORM_MIN_MS - 1;
    expect(checkRsvpClientGuard(null, openedAt, "Budi Santoso")).toEqual({ allowed: true });
  });

  it("flags spam-like names", () => {
    expect(isSpammyRsvpName("https://spam.com")).toBe(true);
    expect(isSpammyRsvpName("aaaaaaa")).toBe(true);
    expect(isSpammyRsvpName("Budi")).toBe(false);
  });
});
