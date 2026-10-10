import { describe, expect, it } from "vitest";
import type { WeddingConfig } from "../../config/wedding.config";
import { getDefaultWeddingContent } from "../../lib/merge-content";
import { buildChecks } from "./siap-kirim-checks";

describe("buildChecks rsvp-deadline", () => {
  const now = Date.parse("2026-10-10T12:00:00+07:00");
  const base = getDefaultWeddingContent();

  function withDeadline(deadline: string): WeddingConfig {
    return {
      ...base,
      rsvp: { ...base.rsvp, deadline },
    } as WeddingConfig;
  }

  it("is ok when deadline is empty (no limit)", () => {
    const check = buildChecks(withDeadline(""), 1, now).find((c) => c.id === "rsvp-deadline");
    expect(check?.ok).toBe(true);
  });

  it("is ok when deadline is in the future", () => {
    const check = buildChecks(withDeadline("2026-12-31T23:59:59+07:00"), 1, now).find(
      (c) => c.id === "rsvp-deadline",
    );
    expect(check?.ok).toBe(true);
  });

  it("is pending when deadline is in the past", () => {
    const check = buildChecks(withDeadline("2026-04-18T23:59:59+07:00"), 1, now).find(
      (c) => c.id === "rsvp-deadline",
    );
    expect(check?.ok).toBe(false);
    expect(check?.hint).toMatch(/sudah lewat/i);
  });
});
