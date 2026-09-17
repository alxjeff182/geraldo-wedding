import { describe, expect, it } from "vitest";
import {
  formatRsvpDeadlineLabel,
  isRsvpDeadlinePassed,
  parseRsvpDeadline,
} from "./rsvp-deadline";

describe("rsvp-deadline", () => {
  it("parses valid deadlines and ignores empty", () => {
    expect(parseRsvpDeadline("")).toBeNull();
    expect(parseRsvpDeadline("2026-04-18T23:59:59+07:00")).toBeInstanceOf(Date);
  });

  it("detects passed deadlines", () => {
    expect(
      isRsvpDeadlinePassed("2026-04-18T23:59:59+07:00", new Date("2026-04-19T00:00:00+07:00")),
    ).toBe(true);
    expect(
      isRsvpDeadlinePassed("2026-04-18T23:59:59+07:00", new Date("2026-04-18T12:00:00+07:00")),
    ).toBe(false);
    expect(isRsvpDeadlinePassed("", new Date())).toBe(false);
  });

  it("formats label with {date}", () => {
    const label = formatRsvpDeadlineLabel(
      "Konfirmasi sebelum {date}",
      "2026-04-18T23:59:59+07:00",
    );
    expect(label).toContain("Konfirmasi sebelum");
    expect(label).toMatch(/2026/);
  });
});
