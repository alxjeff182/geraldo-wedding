import { describe, expect, it } from "vitest";
import { buildGoogleCalendarUrl, buildIcsContent } from "./calendar-links";

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
});
