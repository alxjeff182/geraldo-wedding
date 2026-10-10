import { describe, expect, it } from "vitest";
import {
  isAllowedOrigin,
  isSpammyMessage,
  isSpammyName,
  isUuid,
  isValidFormTiming,
  sanitizeString,
} from "./validate";

describe("submit validate helpers", () => {
  it("rejects invalid UUIDs", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("11111111-1111-4111-8111-111111111111")).toBe(true);
  });

  it("sanitizeString trims and enforces max length", () => {
    expect(sanitizeString("  hi  ", 10)).toBe("hi");
    expect(sanitizeString("", 10)).toBeNull();
    expect(sanitizeString("x".repeat(11), 10)).toBeNull();
  });

  it("flags spammy names", () => {
    expect(isSpammyName("A")).toBe(true);
    expect(isSpammyName("https://evil.com")).toBe(true);
    expect(isSpammyName("Budi Santoso")).toBe(false);
  });

  it("rejects spammy wish messages", () => {
    expect(isSpammyMessage("")).toBeTruthy();
    expect(isSpammyMessage("ok")).toBeTruthy();
    expect(isSpammyMessage("https://spam.com")).toBeTruthy();
    expect(isSpammyMessage("081234567890")).toBeTruthy();
    expect(isSpammyMessage("Selamat menempuh hidup baru!")).toBeNull();
    expect(isSpammyMessage("anjing banget")).toMatch(/tidak pantas/);
  });

  it("validates form timing window", () => {
    const now = Date.now();
    expect(isValidFormTiming(now - 5_000)).toBe(true);
    expect(isValidFormTiming(now - 500)).toBe(false);
    expect(isValidFormTiming(now + 5_000)).toBe(false);
  });

  it("checks allowed origin", () => {
    const allowed = "https://geraldo-christin.vercel.app";
    expect(isAllowedOrigin(allowed, null, allowed)).toBe(true);
    expect(isAllowedOrigin("https://evil.com", null, allowed)).toBe(false);
    expect(isAllowedOrigin(null, `${allowed}/?guest=x`, allowed)).toBe(true);
  });
});
