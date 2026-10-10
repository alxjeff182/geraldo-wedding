import { useEffect, useState } from "react";
import { getDefaultWeddingContent } from "../../lib/merge-content";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";
import type { WeddingConfig } from "../../config/wedding.config";

type Check = { id: string; label: string; ok: boolean; hint?: string };

function buildChecks(content: WeddingConfig, guestCount: number | null): Check[] {
  const defaults = getDefaultWeddingContent();
  const wa = content.contact.whatsappNumber?.trim() ?? "";
  const waPlaceholder = defaults.contact.whatsappNumber;

  const qris = content.gift.qris ?? "";
  const audio = content.media.audio?.trim() ?? "";
  const storyText = (content.story.paragraphs ?? []).join(" ");
  const creatorIg = content.site.creator.instagramUrl?.trim() ?? "";

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
      label: "Instagram pembuat",
      ok: Boolean(creatorIg) && creatorIg !== "https://instagram.com/",
      hint: "Isi link IG di tab Umum.",
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
      ok: Boolean(content.rsvp.deadline?.trim()),
      hint: "Pastikan deadline sesuai rencana acara.",
    },
  ];
}

type Props = {
  merged: WeddingConfig;
};

export function SiapKirimChecklist({ merged }: Props) {
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const checks = buildChecks(merged, guestCount);
  const ready = checks.every((c) => c.ok);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setGuestCount(null);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;

    void supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) {
          setGuestCount(null);
          return;
        }
        setGuestCount(count ?? 0);
      });
  }, []);

  return (
    <section className="admin-checklist admin-field--wide" aria-labelledby="siap-kirim-title">
      <h3 id="siap-kirim-title" className="admin-checklist__title">
        Siap kirim? {ready ? "✓" : "—"}
      </h3>
      <ul className="admin-checklist__list">
        {checks.map((item) => (
          <li key={item.id} className={item.ok ? "is-ok" : "is-pending"}>
            <span>{item.ok ? "✓" : "○"}</span>
            <div>
              <strong>{item.label}</strong>
              {!item.ok && item.hint ? <small>{item.hint}</small> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
