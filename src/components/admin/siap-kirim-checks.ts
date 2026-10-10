import { getDefaultWeddingContent } from "../../lib/merge-content";
import type { WeddingConfig } from "../../config/wedding.config";

export type SiapKirimCheck = { id: string; label: string; ok: boolean; hint?: string };

function isRsvpDeadlineOk(deadline: string | undefined, now = Date.now()): boolean {
  const value = deadline?.trim() ?? "";
  if (!value) return true;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  return parsed > now;
}

export function buildChecks(
  content: WeddingConfig,
  guestCount: number | null,
  now = Date.now(),
): SiapKirimCheck[] {
  const defaults = getDefaultWeddingContent();
  const wa = content.contact.whatsappNumber?.trim() ?? "";
  const waPlaceholder = defaults.contact.whatsappNumber;

  const qris = content.gift.qris ?? "";
  const audio = content.media.audio?.trim() ?? "";
  const storyText = (content.story.paragraphs ?? []).join(" ");
  const creatorSite =
    content.site.creator.websiteUrl?.trim() || content.site.creator.url?.trim() || "";
  const deadlineOk = isRsvpDeadlineOk(content.rsvp.deadline, now);

  return [
    {
      id: "wa",
      label: "Nomor WhatsApp pasangan",
      ok: Boolean(wa) && wa !== waPlaceholder && !/^6281234567890$/.test(wa),
      hint: "Ganti nomor placeholder di tab Undangan / Umum.",
    },
    {
      id: "qris",
      label: "QRIS (bukan dummy)",
      ok: Boolean(qris) && !qris.includes("qris-dummy"),
      hint: "Upload QRIS di tab Gift / Media.",
    },
    {
      id: "audio",
      label: "Musik latar",
      ok: Boolean(audio),
      hint: "Unggah audio di tab Media.",
    },
    {
      id: "story",
      label: "Our Story diisi",
      ok: Boolean(storyText.trim()) && !storyText.includes("[Cerita kalian di sini]"),
      hint: "Edit paragraf story — hindari placeholder.",
    },
    {
      id: "creator",
      label: "Link portfolio pembuat",
      ok: Boolean(creatorSite),
      hint: "Isi URL portfolio di tab Penutup.",
    },
    {
      id: "guests",
      label: "Daftar tamu undangan",
      ok: guestCount !== null && guestCount > 0,
      hint: "Import tamu di tab Undangan.",
    },
    {
      id: "rsvp-deadline",
      label: "Batas RSVP",
      ok: deadlineOk,
      hint: content.rsvp.deadline?.trim()
        ? "Deadline sudah lewat — perbarui di tab RSVP."
        : "Pastikan deadline sesuai rencana acara.",
    },
  ];
}
