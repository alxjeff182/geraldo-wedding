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

/** iPhone / iPad / any Mac browser — prefer Apple Calendar via .ics (not Google web). */
export function prefersAppleCalendar(userAgent = typeof navigator !== "undefined" ? navigator.userAgent : ""): boolean {
  const ua = userAgent;
  const iOS = /iPad|iPhone|iPod/i.test(ua);
  const iPadOs =
    typeof navigator !== "undefined" &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1;
  const mac = /Macintosh|Mac OS X/i.test(ua);
  return iOS || iPadOs || mac;
}

function isIosLike(
  userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "",
): boolean {
  if (/iPad|iPhone|iPod/i.test(userAgent)) return true;
  return (
    typeof navigator !== "undefined" &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1
  );
}

/** Open ICS so iOS/macOS offers Add to Calendar / Calendar.app. */
export function openAppleCalendarIcs(content: string, filename = "wedding.ics") {
  if (isIosLike()) {
    const href = `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
    window.location.href = href;
    return;
  }
  // Mac Chrome/Safari/Firefox: downloading .ics opens Calendar.app reliably.
  downloadIcsFile(filename, content);
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
  if (prefersAppleCalendar()) {
    const ics = buildIcsContent(event);
    if (!ics) return false;
    openAppleCalendarIcs(ics, filename);
    return true;
  }

  if (openGoogleCalendar(event)) return true;

  const ics = buildIcsContent(event);
  if (!ics) return false;
  downloadIcsFile(filename, ics);
  return true;
}
