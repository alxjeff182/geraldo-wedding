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

export function buildCalendarApiUrl(content: string, origin = window.location.origin): string {
  const encoded = toBase64Url(content);
  return `${origin}/api/calendar?ics=${encoded}`;
}

function launchCalendarHref(href: string) {
  // Anchor click keeps the user-gesture chain on iOS better than location.assign alone.
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Open ICS in Calendar.app / iOS Calendar with event titles prefilled.
 * iOS: serve via /api/calendar (https) — Safari shows "Add to Calendar".
 *       data:text/calendar is silently ignored by modern iOS Safari/Chrome.
 * Mac: webcal:// opens Calendar.app (https would only download the file).
 */
export function openAppleCalendarIcs(content: string, filename = "wedding.ics") {
  void filename;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const iOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1);

  const httpsUrl = buildCalendarApiUrl(content);

  if (iOS) {
    launchCalendarHref(httpsUrl);
    // Fallback if the sheet didn't take over (in-app browsers, etc.)
    window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      const webcalUrl = httpsUrl.replace(/^https:/i, "webcal:").replace(/^http:/i, "webcal:");
      window.location.assign(webcalUrl);
    }, 1200);
    return;
  }

  const webcalUrl = httpsUrl.replace(/^https:/i, "webcal:").replace(/^http:/i, "webcal:");
  window.location.assign(webcalUrl);
}

export function openGoogleCalendar(event: CalendarEventInput): boolean {
  const googleUrl = buildGoogleCalendarUrl(event);
  if (!googleUrl) return false;
  window.open(googleUrl, "_blank", "noopener,noreferrer");
  return true;
}

export function isAndroid(
  userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "",
): boolean {
  return /Android/i.test(userAgent);
}

/**
 * INSERT intent for any calendar app (no package lock, no browser_fallback_url).
 * Locking to com.google.android.calendar + browser_fallback_url is what made Chrome
 * open Google Calendar *web* when the app wasn't the default handler.
 */
export function buildAndroidInsertIntent(event: CalendarEventInput): string | null {
  const begin = new Date(event.startsAt).getTime();
  const end = new Date(event.endsAt).getTime();
  if (Number.isNaN(begin) || Number.isNaN(end)) return null;

  const parts = [
    "action=android.intent.action.INSERT",
    "type=vnd.android.cursor.item/event",
    `S.title=${encodeURIComponent(event.title)}`,
    event.details?.trim() ? `S.description=${encodeURIComponent(event.details.trim())}` : null,
    event.location?.trim() ? `S.eventLocation=${encodeURIComponent(event.location.trim())}` : null,
    `l.beginTime=${begin}`,
    `l.endTime=${end}`,
    "end",
  ].filter(Boolean);

  return `intent://#Intent;${parts.join(";")}`;
}

/**
 * Chrome only launches intents whose target accepts CATEGORY_BROWSABLE, so the
 * INSERT intent above is silently dropped. The Google Calendar app does register
 * BROWSABLE links for www.google.com/calendar/event, which opens its event editor.
 */
export function buildAndroidGoogleCalendarIntent(event: CalendarEventInput): string | null {
  const googleUrl = buildGoogleCalendarUrl(event);
  if (!googleUrl) return null;
  const query = googleUrl.split("?")[1] ?? "";
  return (
    `intent://www.google.com/calendar/event?${query}` +
    "#Intent;scheme=https;package=com.google.android.calendar;end"
  );
}

function openAndroidWithWebFallback(nativeHref: string, webHref: string | null, delayMs = 2500) {
  let leftPage = false;
  const markLeft = () => {
    leftPage = true;
  };
  window.addEventListener("blur", markLeft, { once: true });
  window.addEventListener("pagehide", markLeft, { once: true });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") markLeft();
    },
    { once: true },
  );

  window.location.assign(nativeHref);
  if (!webHref) return;
  window.setTimeout(() => {
    window.removeEventListener("blur", markLeft);
    window.removeEventListener("pagehide", markLeft);
    if (leftPage || document.visibilityState !== "visible") return;
    window.open(webHref, "_blank", "noopener,noreferrer");
  }, delayMs);
}

/** Android browser → open the Google Calendar app's event editor, prefilled. */
export function openAndroidCalendar(event: CalendarEventInput): boolean {
  const googleUrl = buildGoogleCalendarUrl(event);
  const gcalIntent = buildAndroidGoogleCalendarIntent(event);
  if (gcalIntent) {
    openAndroidWithWebFallback(gcalIntent, googleUrl);
    return true;
  }

  if (!googleUrl) return false;
  window.open(googleUrl, "_blank", "noopener,noreferrer");
  return true;
}

export function openCalendarForEvent(event: CalendarEventInput, filename = "wedding.ics"): boolean {
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

  if (isAndroid()) {
    const primary = { ...events[0] };
    if (events.length > 1) {
      const others = events
        .slice(1)
        .map((e) => `• ${e.title} (${e.details?.split("\n")[0] ?? ""})`)
        .join("\n");
      primary.details = [primary.details?.trim(), "", "Acara lainnya:", others]
        .filter((line) => line !== undefined)
        .join("\n")
        .trim();
    }
    return openAndroidCalendar(primary);
  }

  if (openGoogleCalendar(events[0])) return true;

  const ics = buildIcsCalendar(events, calendarName);
  if (!ics) return false;
  downloadIcsFile(filename, ics);
  return true;
}
