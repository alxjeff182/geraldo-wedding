import { buildWhatsAppUrl, formatPhoneDisplay } from "./invite-links";

export type WaExportGuest = {
  id: string;
  display_name: string;
  phone: string | null;
  slug: string;
};

export type WaExportEntry = {
  id: string;
  index: number;
  name: string;
  phone: string | null;
  phoneDisplay: string;
  message: string;
  waUrl: string | null;
  hasPhone: boolean;
};

export function buildWaExportEntries(
  guests: readonly WaExportGuest[],
  buildMessage: (guest: WaExportGuest) => string,
): WaExportEntry[] {
  return guests.map((guest, i) => {
    const phone = guest.phone?.trim() || null;
    const message = buildMessage(guest);
    return {
      id: guest.id,
      index: i + 1,
      name: guest.display_name,
      phone,
      phoneDisplay: phone ? formatPhoneDisplay(phone) : "",
      message,
      waUrl: phone ? buildWhatsAppUrl(phone, message) : null,
      hasPhone: Boolean(phone),
    };
  });
}

/**
 * WhatsApp-safe pack: name + lone wa.me URL, separated by blank lines.
 * Adjacent long URLs get glued/corrupted when pasted into WA without gaps.
 */
export function formatWaExportPlainText(entries: readonly WaExportEntry[]): string {
  if (entries.length === 0) return "";

  const ready = entries.filter((entry) => entry.waUrl);
  if (ready.length === 0) return "";

  const blocks = ready.map((entry) => `${entry.index}. ${entry.name}\n${entry.waUrl}`);

  // Triple newline keeps each wa.me on its own “island” in WhatsApp.
  return `${blocks.join("\n\n\n")}\n`;
}

/** wa.me URLs only, still spaced so WhatsApp does not merge them. */
export function formatWaExportLinksOnly(entries: readonly WaExportEntry[]): string {
  const links = entries.map((entry) => entry.waUrl).filter((url): url is string => Boolean(url));
  if (links.length === 0) return "";
  return `${links.join("\n\n\n")}\n`;
}

export function downloadWaExportText(text: string, filename?: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `link-wa-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
