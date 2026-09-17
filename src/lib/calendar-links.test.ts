import { describe, expect, it } from "vitest";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  prefersAppleCalendar,
} from "./calendar-links";

describe("calendar-links", () => {
  const event = {
    title: "Pemberkatan Geraldo & Christin",
    details: "Undangan pernikahan",
    location: "GPI Pondok Arum, Tangerang",
    startsAt: "2026-04-25T08:00:00+07:00",
    endsAt: "2026-04-25T10:00:00+07:00",
  };

  it("builds a Google Calendar URL", () => {
    const url = buildGoogleCalendarUrl(event);
    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("text=Pemberkatan");
    expect(url).toContain("20260425T010000Z");
    expect(url).toContain("20260425T030000Z");
  });

  it("builds ICS content", () => {
    const ics = buildIcsContent(event);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Pemberkatan Geraldo & Christin");
    expect(ics).toContain("DTSTART:20260425T010000Z");
  });

  it("returns null for invalid dates", () => {
    expect(buildGoogleCalendarUrl({ ...event, startsAt: "bad" })).toBeNull();
    expect(buildIcsContent({ ...event, endsAt: "" })).toBeNull();
  });

  it("detects Apple calendar clients", () => {
    expect(prefersAppleCalendar("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(
      true,
    );
    expect(
      prefersAppleCalendar(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      ),
    ).toBe(true);
    expect(
      prefersAppleCalendar(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
  });
});
