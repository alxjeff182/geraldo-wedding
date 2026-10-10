export const MAX_NAME = 200;
export const MAX_WISH_MESSAGE = 500;
export const MIN_FORM_MS = 3_000;
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

export const BAD_WORDS = [
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

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

export function sanitizeString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isSpammyName(name: string): boolean {
  const trimmed = name.trim();
  const lowered = trimmed.toLowerCase();
  if (/https?:\/\/|www\.|\.[a-z]{2,}\//i.test(lowered)) return true;
  if (/(.)\1{5,}/.test(trimmed)) return true;
  if ((trimmed.match(/[a-zA-Z]/g) ?? []).length < 2) return true;
  return false;
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

export function isSpammyMessage(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return "Data ucapan tidak valid";
  if (trimmed.length > MAX_WISH_MESSAGE) {
    return "Ucapan terlalu panjang (maks. 500 karakter).";
  }

  const letters = (trimmed.match(/[a-zA-Z\u00C0-\u024F]/g) ?? []).length;
  if (letters < 3) return "Ucapan terlalu pendek.";

  if (/https?:\/\/|www\.|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) {
    return "Ucapan berisi tautan atau nomor tidak diperbolehkan.";
  }
  if (/\d[\d\s().-]{7,}\d/.test(trimmed) || (trimmed.match(/\d/g) ?? []).length >= 9) {
    return "Ucapan berisi tautan atau nomor tidak diperbolehkan.";
  }
  if (/(.)\1{5,}/.test(trimmed)) return "Ucapan tidak valid.";

  const normalized = normalizeWishText(trimmed);
  if (BAD_WORDS.some((word) => new RegExp(`(?:^|\\s)${word}(?:$|\\s)`).test(normalized))) {
    return "Ucapan mengandung kata yang tidak pantas.";
  }

  return null;
}

export function isValidFormTiming(formOpenedAt: unknown): boolean {
  if (typeof formOpenedAt !== "number" || !Number.isFinite(formOpenedAt)) return false;
  const age = Date.now() - formOpenedAt;
  if (formOpenedAt > Date.now() + 1_000) return false;
  return age >= MIN_FORM_MS && age <= MAX_FORM_AGE_MS;
}

export function isAllowedOrigin(
  origin: string | null,
  referer: string | null,
  allowedOrigin: string | null,
): boolean {
  if (!allowedOrigin) return true;

  const normalizedAllowed = allowedOrigin.replace(/\/$/, "");

  if (origin) return origin === normalizedAllowed || origin.startsWith(`${normalizedAllowed}/`);
  if (referer) return referer.startsWith(normalizedAllowed);

  return false;
}
