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

/** Plain-text pack for paste into Notes / chat — easy to scan one guest at a time. */
export function formatWaExportPlainText(entries: readonly WaExportEntry[]): string {
  if (entries.length === 0) return "";

  const blocks = entries.map((entry) => {
    const phoneLine = entry.hasPhone ? `WA: ${entry.phone}` : "WA: (belum ada nomor)";
    return [`${entry.index}. ${entry.name}`, phoneLine, "─".repeat(28), entry.message.trim()].join(
      "\n",
    );
  });

  return [
    `Daftar pesan WhatsApp (${entries.length} tamu)`,
    `Dibuat: ${new Date().toLocaleString("id-ID")}`,
    "═".repeat(32),
    "",
    blocks.join(`\n\n${"═".repeat(32)}\n\n`),
    "",
  ].join("\n");
}

export function downloadWaExportText(text: string, filename?: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `pesan-wa-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
