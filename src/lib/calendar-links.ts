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

export function buildIcsContent(event: CalendarEventInput): string | null {
  const start = toGoogleUtc(event.startsAt);
  const end = toGoogleUtc(event.endsAt);
  if (!start || !end) return null;

  const stamp = toGoogleUtc(new Date().toISOString());
  const uid = `${start}-${escapeIcsText(event.title).slice(0, 40)}@geraldo-christin`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Geraldo Christin Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.details?.trim() ? `DESCRIPTION:${escapeIcsText(event.details.trim())}` : null,
    event.location?.trim() ? `LOCATION:${escapeIcsText(event.location.trim())}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
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

/** iPhone / iPad / Mac Safari — Google Calendar web add often fails; ICS opens Apple Calendar. */
export function prefersAppleCalendar(userAgent = typeof navigator !== "undefined" ? navigator.userAgent : ""): boolean {
  const ua = userAgent;
  const iOS = /iPad|iPhone|iPod/i.test(ua);
  const iPadOs = typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const macSafari = /Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|CriOS|Edg|Firefox|Chromium/i.test(ua);
  return iOS || iPadOs || macSafari;
}

/** Open ICS via data-URI so iOS/macOS offers Add to Calendar. */
export function openAppleCalendarIcs(content: string) {
  const href = `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
  window.location.href = href;
}

export function openCalendarForEvent(
  event: CalendarEventInput,
  filename = "wedding.ics",
): boolean {
  if (prefersAppleCalendar()) {
    const ics = buildIcsContent(event);
    if (!ics) return false;
    openAppleCalendarIcs(ics);
    return true;
  }

  const googleUrl = buildGoogleCalendarUrl(event);
  if (googleUrl) {
    window.open(googleUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  const ics = buildIcsContent(event);
  if (!ics) return false;
  downloadIcsFile(filename, ics);
  return true;
}
