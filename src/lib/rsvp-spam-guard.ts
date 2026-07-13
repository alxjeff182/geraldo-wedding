const STORAGE_PREFIX = "gw-rsvp-submitted:";
export const RSVP_FORM_MIN_MS = 3_000;
export const RSVP_CLIENT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function storageKey(guestId: string | null): string {
  return `${STORAGE_PREFIX}${guestId ?? "anon"}`;
}

export function getRsvpSubmittedAt(guestId: string | null): number | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(storageKey(guestId));
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function hasRsvpSubmitted(guestId: string | null): boolean {
  const submittedAt = getRsvpSubmittedAt(guestId);
  if (!submittedAt) return false;
  return Date.now() - submittedAt < RSVP_CLIENT_COOLDOWN_MS;
}

export function markRsvpSubmitted(guestId: string | null): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(guestId), String(Date.now()));
}

export function isSpammyRsvpName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true;

  const lowered = trimmed.toLowerCase();
  if (/https?:\/\/|www\.|\.[a-z]{2,}\//i.test(lowered)) return true;
  if (/(.)\1{5,}/.test(trimmed)) return true;
  if ((trimmed.match(/[a-zA-Z]/g) ?? []).length < 2) return true;

  return false;
}

export type RsvpClientGuardResult =
  | { allowed: true }
  | { allowed: false; reason: "already_submitted" | "too_fast" | "spam_name" };

export function checkRsvpClientGuard(
  guestId: string | null,
  formOpenedAt: number,
  name: string,
): RsvpClientGuardResult {
  if (hasRsvpSubmitted(guestId)) {
    return { allowed: false, reason: "already_submitted" };
  }

  if (Date.now() - formOpenedAt < RSVP_FORM_MIN_MS) {
    return { allowed: false, reason: "too_fast" };
  }

  if (isSpammyRsvpName(name)) {
    return { allowed: false, reason: "spam_name" };
  }

  return { allowed: true };
}
