import { buildWhatsAppChatUrl, buildWhatsAppUrl, formatPhoneDisplay } from "./invite-links";

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
  /** Short https://wa.me/62… — safe to paste / click in WhatsApp. */
  chatUrl: string | null;
  /** Full prefilled deep link — only for window.open (“Buka WA”). */
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
      chatUrl: phone ? buildWhatsAppChatUrl(phone) : null,
      waUrl: phone ? buildWhatsAppUrl(phone, message) : null,
      hasPhone: Boolean(phone),
    };
  });
}

/**
 * Readable pack for Notes / .txt:
 * short chat link + plain message (never the encoded ?text= monster URL).
 */
export function formatWaExportPlainText(entries: readonly WaExportEntry[]): string {
  if (entries.length === 0) return "";

  const ready = entries.filter((entry) => entry.chatUrl);
  if (ready.length === 0) return "";

  const blocks = ready.map((entry) => {
    const phoneLine = entry.phone ? `\n${entry.phone}` : "";
    return `${entry.index}. ${entry.name}${phoneLine}\n${entry.chatUrl}\n\n${entry.message}`;
  });

  return `${blocks.join("\n\n———\n\n")}\n`;
}

/** Short wa.me chat links only — one per block, easy to tap in WhatsApp. */
export function formatWaExportLinksOnly(entries: readonly WaExportEntry[]): string {
  const ready = entries.filter((entry) => entry.chatUrl);
  if (ready.length === 0) return "";

  const blocks = ready.map((entry) => `${entry.index}. ${entry.name}\n${entry.chatUrl}`);
  return `${blocks.join("\n\n")}\n`;
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
