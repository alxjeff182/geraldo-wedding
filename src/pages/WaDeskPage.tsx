import { useCallback, useEffect, useMemo, useState } from "react";
import { getInviteTemplateById } from "../config/invite-templates";
import { useWeddingContent } from "../context/use-wedding-content";
import { usePageMeta } from "../hooks/usePageMeta";
import { buildGuestInviteUrl, buildWhatsAppUrl, formatInviteMessage } from "../lib/invite-links";
import { fetchWaDeskGuests, markWaDeskGuestSent, type WaDeskGuest } from "../lib/wa-desk-api";
import "../styles/wa-desk.css";

type Props = {
  token: string;
};

type Filter = "all" | "unsent" | "sent";

export function WaDeskPage({ token }: Props) {
  const { content, loading: contentLoading } = useWeddingContent();
  const [guests, setGuests] = useState<WaDeskGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("unsent");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  usePageMeta(content, { noIndex: true });

  useEffect(() => {
    document.title = "Meja kirim WA";
    let el = document.querySelector('meta[name="robots"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "robots");
      document.head.appendChild(el);
    }
    el.setAttribute("content", "noindex, nofollow, noarchive");

    let ref = document.querySelector('meta[name="referrer"]');
    if (!ref) {
      ref = document.createElement("meta");
      ref.setAttribute("name", "referrer");
      document.head.appendChild(ref);
    }
    ref.setAttribute("content", "no-referrer");
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { guests: rows, error: err } = await fetchWaDeskGuests(token);
    if (err) {
      setError(err);
      setGuests([]);
    } else {
      setGuests(rows);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const invite = content.invite;
  const siteUrl = content.site.url;
  const coupleTitle = content.site.title;
  const dateLabel = content.dateLabel;
  const location = content.location;
  const acaraSummary = content.events.map((e) => `${e.name} ${e.time}`).join(" · ");
  const venueSummary = content.events.map((e) => e.venue).join(" · ");
  const template = getInviteTemplateById(invite.whatsappTemplates, invite.defaultTemplateId);

  const buildMessage = useCallback(
    (guest: Pick<WaDeskGuest, "display_name" | "slug">) => {
      return formatInviteMessage(template.message, {
        nama: guest.display_name,
        link: buildGuestInviteUrl(siteUrl, guest.slug),
        tanggal: dateLabel,
        lokasi: location,
        pasangan: coupleTitle,
        salam: invite.salutation,
        slug: guest.slug,
        acara: acaraSummary,
        venue: venueSummary,
      });
    },
    [
      template.message,
      siteUrl,
      dateLabel,
      location,
      coupleTitle,
      invite.salutation,
      acaraSummary,
      venueSummary,
    ],
  );

  const withPhone = useMemo(() => guests.filter((g) => g.phone?.trim()), [guests]);
  const sentCount = withPhone.filter((g) => g.invite_sent_at).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withPhone.filter((g) => {
      if (filter === "unsent" && g.invite_sent_at) return false;
      if (filter === "sent" && !g.invite_sent_at) return false;
      if (!q) return true;
      return (
        g.display_name.toLowerCase().includes(q) ||
        (g.phone ?? "").includes(q) ||
        (g.notes ?? "").toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q)
      );
    });
  }, [withPhone, filter, search]);

  const openWa = async (guest: WaDeskGuest) => {
    if (!guest.phone) return;
    const waUrl = buildWhatsAppUrl(guest.phone, buildMessage(guest));
    if (!waUrl) {
      notify("Nomor WA tidak valid");
      return;
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!guest.invite_sent_at) {
      setBusyId(guest.id);
      const { invite_sent_at, error: err } = await markWaDeskGuestSent(token, guest.id, true);
      setBusyId(null);
      if (err) {
        notify(err);
        return;
      }
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, invite_sent_at } : g)));
      notify("Ditandai terkirim");
    }
  };

  const sendNext = () => {
    const next = withPhone.find((g) => !g.invite_sent_at);
    if (!next) {
      notify("Semua sudah ditandai terkirim");
      return;
    }
    void openWa(next);
  };

  const toggleSent = async (guest: WaDeskGuest) => {
    const sent = !guest.invite_sent_at;
    setBusyId(guest.id);
    const { invite_sent_at, error: err } = await markWaDeskGuestSent(token, guest.id, sent);
    setBusyId(null);
    if (err) {
      notify(err);
      return;
    }
    setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, invite_sent_at } : g)));
    notify(sent ? "Ditandai terkirim" : "Dikembalikan ke belum");
  };

  if (contentLoading || loading) {
    return (
      <div className="wa-desk">
        <p className="wa-desk__status">Memuat meja kirim…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wa-desk">
        <div className="wa-desk__error">
          <h1>Link tidak valid</h1>
          <p>Halaman ini tidak bisa dibuka. Periksa URL atau minta link baru.</p>
          <button type="button" className="wa-desk__btn" onClick={() => void load()}>
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wa-desk">
      <header className="wa-desk__header">
        <p className="wa-desk__eyebrow">Meja kirim · tanpa login</p>
        <h1 className="wa-desk__title">Kirim undangan WA</h1>
        <p className="wa-desk__meta">
          <strong>{sentCount}</strong> / {withPhone.length} terkirim
        </p>
        <div className="wa-desk__actions">
          <button type="button" className="wa-desk__btn wa-desk__btn--primary" onClick={sendNext}>
            Kirim berikutnya
          </button>
          <button type="button" className="wa-desk__btn" onClick={() => void load()}>
            Muat ulang
          </button>
        </div>
      </header>

      <div className="wa-desk__toolbar">
        <input
          className="wa-desk__search"
          type="search"
          placeholder="Cari nama / nomor / keterangan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="wa-desk__filters" role="group" aria-label="Filter status">
          {(
            [
              ["unsent", "Belum"],
              ["sent", "Terkirim"],
              ["all", "Semua"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`wa-desk__chip${filter === id ? " is-active" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="wa-desk__list">
        {visible.length === 0 ? (
          <li className="wa-desk__empty">Tidak ada tamu di filter ini.</li>
        ) : (
          visible.map((guest) => (
            <li key={guest.id} className="wa-desk__row">
              <div className="wa-desk__identity">
                <strong>{guest.display_name}</strong>
                <span>{guest.phone}</span>
                {guest.notes ? <em>{guest.notes}</em> : null}
                <span className={`wa-desk__badge${guest.invite_sent_at ? " is-sent" : ""}`}>
                  {guest.invite_sent_at ? "Terkirim" : "Belum"}
                </span>
              </div>
              <div className="wa-desk__row-actions">
                <button
                  type="button"
                  className="wa-desk__btn wa-desk__btn--primary"
                  disabled={busyId === guest.id}
                  onClick={() => void openWa(guest)}
                >
                  Buka WA
                </button>
                <button
                  type="button"
                  className="wa-desk__btn"
                  disabled={busyId === guest.id}
                  onClick={() => void toggleSent(guest)}
                >
                  {guest.invite_sent_at ? "Batalkan" : "Tandai"}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {toast ? <p className="wa-desk__toast">{toast}</p> : null}
    </div>
  );
}
