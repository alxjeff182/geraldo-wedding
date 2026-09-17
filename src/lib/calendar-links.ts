export type CalendarEventInput = {
  title: string;
  details?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
};

function toGoogleUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string | null {
  const start = toGoogleUtc(event.startsAt);
  const end = toGoogleUtc(event.endsAt);
  if (!start || !end) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });
  if (event.details?.trim()) params.set("details", event.details.trim());
  if (event.location?.trim()) params.set("location", event.location.trim());

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildVEvent(event: CalendarEventInput): string[] | null {
  const start = toGoogleUtc(event.startsAt);
  const end = toGoogleUtc(event.endsAt);
  if (!start || !end) return null;

  const stamp = toGoogleUtc(new Date().toISOString());
  const uid = `${start}-${escapeIcsText(event.title).slice(0, 40)}@geraldo-christin`;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.details?.trim() ? `DESCRIPTION:${escapeIcsText(event.details.trim())}` : null,
    event.location?.trim() ? `LOCATION:${escapeIcsText(event.location.trim())}` : null,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  ].filter((line): line is string => Boolean(line));
}

/** Single-event ICS (tests + Events section download). */
export function buildIcsContent(event: CalendarEventInput): string | null {
  return buildIcsCalendar([event], event.title);
}

/** Multi-event ICS with calendar name so Apple Calendar autofills titles. */
export function buildIcsCalendar(
  events: readonly CalendarEventInput[],
  calendarName: string,
): string | null {
  const vevents = events.flatMap((event) => buildVEvent(event) ?? []);
  if (vevents.length === 0) return null;

  const name = calendarName.trim() || "Pernikahan";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Geraldo Christin Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(name)}`,
    `NAME:${escapeIcsText(name)}`,
    "X-WR-TIMEZONE:Asia/Jakarta",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** iPhone / iPad / any Mac browser — prefer Apple Calendar via .ics (not Google web). */
export function prefersAppleCalendar(
  userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "",
): boolean {
  const ua = userAgent;
  const iOS = /iPad|iPhone|iPod/i.test(ua);
  const iPadOs =
    typeof navigator !== "undefined" &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1;
  const mac = /Macintosh|Mac OS X/i.test(ua);
  return iOS || iPadOs || mac;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Open ICS so Calendar.app / iOS Calendar imports events with SUMMARY prefilled.
 * Uses https://api (inline .ics) on Mac — not webcal subscribe (that often blanks the name).
 */
export function openAppleCalendarIcs(content: string, _filename = "wedding.ics") {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const iOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1);

  if (iOS) {
    window.location.assign(`data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`);
    return;
  }

  const encoded = toBase64Url(content);
  const httpsUrl = `${window.location.origin}/api/calendar?ics=${encoded}`;
  // https + text/calendar → Calendar.app "Add" dialog with event title filled
  window.location.assign(httpsUrl);
}

export function openGoogleCalendar(event: CalendarEventInput): boolean {
  const googleUrl = buildGoogleCalendarUrl(event);
  if (!googleUrl) return false;
  window.open(googleUrl, "_blank", "noopener,noreferrer");
  return true;
}

export function openCalendarForEvent(
  event: CalendarEventInput,
  filename = "wedding.ics",
): boolean {
  return openCalendarForEvents([event], event.title, filename);
}

export function openCalendarForEvents(
  events: readonly CalendarEventInput[],
  calendarName: string,
  filename = "wedding.ics",
): boolean {
  if (events.length === 0) return false;

  if (prefersAppleCalendar()) {
    const ics = buildIcsCalendar(events, calendarName);
    if (!ics) return false;
    openAppleCalendarIcs(ics, filename);
    return true;
  }

  if (openGoogleCalendar(events[0])) return true;

  const ics = buildIcsCalendar(events, calendarName);
  if (!ics) return false;
  downloadIcsFile(filename, ics);
  return true;
}
