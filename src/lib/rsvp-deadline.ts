export function parseRsvpDeadline(deadline: string | null | undefined): Date | null {
  const raw = deadline?.trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isRsvpDeadlinePassed(
  deadline: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const date = parseRsvpDeadline(deadline);
  if (!date) return false;
  return now.getTime() > date.getTime();
}

export function formatRsvpDeadlineLabel(
  template: string,
  deadline: string | null | undefined,
  locale = "id-ID",
): string {
  const date = parseRsvpDeadline(deadline);
  if (!date) return "";
  const formatted = date.toLocaleString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return template.replace(/\{date\}/g, formatted);
}
