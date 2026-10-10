export const WISH_FORM_MIN_MS = 3_000;
export const WISH_MAX_PER_GUEST = 3;
export const WISH_MAX_MESSAGE = 500;
export const WISH_MIN_MESSAGE_LETTERS = 3;

const STORAGE_PREFIX = "gw-wish-count:";

function storageKey(guestId: string): string {
  return `${STORAGE_PREFIX}${guestId}`;
}

export function getWishCount(guestId: string | null): number {
  if (typeof window === "undefined" || !guestId) return 0;
  const raw = window.localStorage.getItem(storageKey(guestId));
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function markWishSubmitted(guestId: string | null): void {
  if (typeof window === "undefined" || !guestId) return;
  const next = Math.min(WISH_MAX_PER_GUEST, getWishCount(guestId) + 1);
  window.localStorage.setItem(storageKey(guestId), String(next));
}

export function normalizeWishText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BAD_WORDS = [
  "anjing",
  "bangsat",
  "bajingan",
  "kontol",
  "memek",
  "ngentot",
  "asu",
  "fuck",
  "shit",
  "bitch",
  "asshole",
];

export type WishSpamReason =
  "empty" | "too_short" | "too_long" | "link" | "phone" | "repeat" | "profanity";

export function isSpammyWishMessage(message: string): WishSpamReason | null {
  const trimmed = message.trim();
  if (!trimmed) return "empty";
  if (trimmed.length > WISH_MAX_MESSAGE) return "too_long";

  const letters = (trimmed.match(/[a-zA-Z\u00C0-\u024F]/g) ?? []).length;
  if (letters < WISH_MIN_MESSAGE_LETTERS) return "too_short";

  if (/https?:\/\/|www\.|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) {
    return "link";
  }
  if (/\d[\d\s().-]{7,}\d/.test(trimmed) || (trimmed.match(/\d/g) ?? []).length >= 9) {
    return "phone";
  }
  if (/(.)\1{5,}/.test(trimmed)) return "repeat";

  const normalized = normalizeWishText(trimmed);
  if (BAD_WORDS.some((word) => new RegExp(`(?:^|\\s)${word}(?:$|\\s)`).test(normalized))) {
    return "profanity";
  }

  return null;
}

export type WishClientGuardResult =
  | { allowed: true; remaining: number }
  | {
      allowed: false;
      reason: "no_guest" | "limit_reached" | "too_fast" | WishSpamReason;
    };

export function checkWishClientGuard(
  guestKey: string | null,
  formOpenedAt: number,
  message: string,
): WishClientGuardResult {
  if (!guestKey) return { allowed: false, reason: "no_guest" };

  const count = getWishCount(guestKey);
  if (count >= WISH_MAX_PER_GUEST) {
    return { allowed: false, reason: "limit_reached" };
  }

  if (Date.now() - formOpenedAt < WISH_FORM_MIN_MS) {
    return { allowed: false, reason: "too_fast" };
  }

  const spam = isSpammyWishMessage(message);
  if (spam) return { allowed: false, reason: spam };

  return { allowed: true, remaining: WISH_MAX_PER_GUEST - count - 1 };
}
