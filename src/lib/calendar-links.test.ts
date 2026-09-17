import { describe, expect, it } from "vitest";
import {
  buildAndroidInsertIntent,
  buildGoogleCalendarUrl,
  buildIcsCalendar,
  buildIcsContent,
  isAndroid,
  prefersAppleCalendar,
} from "./calendar-links";

describe("calendar-links", () => {
  const event = {
    title: "Pemberkatan - Geraldo & Christin",
    details: "Undangan pernikahan",
    location: "GPI Pondok Arum, Tangerang",
    startsAt: "2026-04-25T08:00:00+07:00",
    endsAt: "2026-04-25T10:00:00+07:00",
  };

  const reception = {
    title: "Resepsi & Adat - Geraldo & Christin",
    details: "Resepsi",
    location: "UFIT HALL GK, Tangerang",
    startsAt: "2026-04-25T11:00:00+07:00",
    endsAt: "2026-04-25T15:00:00+07:00",
  };

  it("builds a Google Calendar URL", () => {
    const url = buildGoogleCalendarUrl(event);
    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("text=Pemberkatan");
    expect(url).toContain("20260425T010000Z");
    expect(url).toContain("20260425T030000Z");
  });

  it("builds ICS content with event title", () => {
    const ics = buildIcsContent(event);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Pemberkatan - Geraldo & Christin");
    expect(ics).toContain("DTSTART:20260425T010000Z");
    expect(ics).toContain("X-WR-CALNAME:Pemberkatan - Geraldo & Christin");
  });

  it("builds multi-event ICS with calendar name", () => {
    const ics = buildIcsCalendar([event, reception], "Pernikahan Geraldo & Christin");
    expect(ics).toContain("X-WR-CALNAME:Pernikahan Geraldo & Christin");
    expect(ics).toContain("SUMMARY:Pemberkatan - Geraldo & Christin");
    expect(ics).toContain("SUMMARY:Resepsi & Adat - Geraldo & Christin");
    expect(ics?.match(/BEGIN:VEVENT/g)?.length).toBe(2);
  });

  it("builds Android insert intent targeting Google Calendar app", () => {
    const intent = buildAndroidInsertIntent(event);
    expect(intent).toContain("intent://");
    expect(intent).toContain("android.intent.action.INSERT");
    expect(intent).toContain("vnd.android.cursor.item/event");
    expect(intent).toContain("package=com.google.android.calendar");
    expect(intent).toContain("S.title=");
    expect(intent).toContain(encodeURIComponent("Pemberkatan - Geraldo & Christin"));
    expect(intent).toContain("l.beginTime=");
    expect(intent).toContain("l.endTime=");
  });

  it("detects Android", () => {
    expect(
      isAndroid(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe(true);
    expect(isAndroid("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(false);
  });

  it("returns null for invalid dates", () => {
    expect(buildGoogleCalendarUrl({ ...event, startsAt: "bad" })).toBeNull();
    expect(buildIcsContent({ ...event, endsAt: "" })).toBeNull();
    expect(buildAndroidInsertIntent({ ...event, startsAt: "bad" })).toBeNull();
  });

  it("detects Apple calendar clients including Mac Chrome", () => {
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
    ).toBe(true);
    expect(
      prefersAppleCalendar(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
  });
});
