import { useEffect, useRef, useState, type FormEvent } from "react";
import { fetchPublicWishes, isSupabaseConfigured, type Wish } from "../../../lib/supabase-rest";
import { submitForm } from "../../../lib/submit-form";
import {
  WISH_MAX_MESSAGE,
  WISH_MAX_PER_GUEST,
  checkWishClientGuard,
  getWishCount,
  markWishSubmitted,
} from "../../../lib/wish-guard";
import { useWeddingContent } from "../../../context/use-wedding-content";

type Props = {
  guestId: string | null;
  guestName: string;
  onToast: (msg: string) => void;
};

const PAGE = 5;
const POLL_MS = 30_000;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function guardMessage(
  reason: string,
  gb: {
    lockedMessage: string;
    limitReachedMessage: string;
    errorMessage: string;
  },
): string {
  if (reason === "no_guest") return gb.lockedMessage;
  if (reason === "limit_reached") return gb.limitReachedMessage;
  if (reason === "too_fast") return "Mohon tunggu sebentar sebelum mengirim.";
  if (reason === "link" || reason === "phone") {
    return "Ucapan berisi tautan atau nomor tidak diperbolehkan.";
  }
  if (reason === "profanity") return "Ucapan mengandung kata yang tidak pantas.";
  if (reason === "too_short") return "Ucapan terlalu pendek.";
  if (reason === "too_long") return "Ucapan terlalu panjang (maks. 500 karakter).";
  if (reason === "repeat" || reason === "empty") return "Ucapan tidak valid.";
  return gb.errorMessage;
}

export function Wishes({ guestId, guestName, onToast }: Props) {
  const { content } = useWeddingContent();
  const gb = content.guestbook;
  const guestKey = guestId;
  const formOpenedAt = useRef(Date.now());
  const sectionRef = useRef<HTMLElement>(null);
  const [items, setItems] = useState<Wish[]>([]);
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [supabaseOk, setSupabaseOk] = useState(isSupabaseConfigured);
  const [sentCount, setSentCount] = useState(() => getWishCount(guestKey));
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setSentCount(getWishCount(guestKey));
    formOpenedAt.current = Date.now();
  }, [guestKey]);

  const fetchWishes = () => {
    if (!isSupabaseConfigured) {
      setSupabaseOk(false);
      return;
    }
    void fetchPublicWishes().then(({ data, error }) => {
      if (error) {
        setSupabaseOk(false);
        return;
      }
      setSupabaseOk(true);
      if (data) setItems(data);
    });
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { root: null, threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || document.visibilityState !== "visible") return;
    const id = window.setInterval(fetchWishes, POLL_MS);
    return () => window.clearInterval(id);
  }, [inView]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && inView) {
        fetchWishes();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [inView]);

  const pages = Math.max(1, Math.ceil(items.length / PAGE));
  const slice = items.slice(page * PAGE, page * PAGE + PAGE);
  const remaining = Math.max(0, WISH_MAX_PER_GUEST - sentCount);
  const canSubmit = Boolean(guestId) && remaining > 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const guard = checkWishClientGuard(guestKey, formOpenedAt.current, message);
    if (!guard.allowed) {
      onToast(guardMessage(guard.reason, gb));
      return;
    }

    setSubmitting(true);
    const result = await submitForm({
      type: "wish",
      honeypot: "",
      companyHoneypot: company,
      formOpenedAt: formOpenedAt.current,
      payload: {
        guest_id: guestId,
        name: guestName.trim() || "Tamu",
        message: message.trim(),
      },
      messages: {
        successMessage: gb.successMessage,
        localSuccessMessage: gb.localSuccessMessage,
        networkErrorMessage: gb.networkErrorMessage,
        supabaseErrorMessage: gb.supabaseErrorMessage,
      },
    });
    setSubmitting(false);

    if (!result.ok) {
      onToast(result.error ?? gb.errorMessage);
      return;
    }

    markWishSubmitted(guestKey);
    setSentCount(getWishCount(guestKey));
    onToast(result.message ?? gb.successMessage);
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        guest_id: guestId,
        name: guestName.trim() || "Tamu",
        message: message.trim(),
        attendance: null,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setMessage("");
    setPage(0);
    formOpenedAt.current = Date.now();
    fetchWishes();
  };

  return (
    <section
      ref={sectionRef}
      id="wishes"
      className="section wishes-mod fade-up"
      aria-label={gb.title}
    >
      <div className="section__head">
        <p className="eyebrow">Ucapan</p>
        <h3>{gb.title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <p className="gift__lead">{gb.subtitle}</p>

      {canSubmit ? (
        <form className="wishes-form sheet-form" onSubmit={(e) => void onSubmit(e)}>
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ display: "none" }}
            aria-hidden="true"
          />
          <div className="sheet-form__field">
            <span className="sheet-form__label">Nama</span>
            <p className="wishes-namechip">{guestName}</p>
          </div>
          <label className="sheet-form__field">
            <span className="sheet-form__label">Ucapan</span>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={gb.messagePlaceholder}
              required
              maxLength={WISH_MAX_MESSAGE}
            />
            <span className="sheet-form__count">
              {message.length}/{WISH_MAX_MESSAGE}
            </span>
          </label>
          <p className="wishes-remaining">
            {(gb.remainingLabel ?? "Sisa {n} ucapan").replace("{n}", String(remaining))}
          </p>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? gb.submitting : gb.submit}
          </button>
        </form>
      ) : (
        <p className="wishes-locked">{!guestId ? gb.lockedMessage : gb.limitReachedMessage}</p>
      )}

      <div className="wishes-list">
        {slice.length === 0 ? (
          <p className="gift__lead">{supabaseOk ? gb.emptyMessage : gb.emptyNoSupabase}</p>
        ) : (
          slice.map((wish) => (
            <article key={wish.id} className="wish-card">
              <div className="wish-card__head">
                <p className="wish-card__name">{wish.name}</p>
                <time className="wish-card__time" dateTime={wish.created_at}>
                  {relativeTime(wish.created_at)}
                </time>
              </div>
              <p className="wish-card__msg">{wish.message}</p>
            </article>
          ))
        )}
      </div>

      {pages > 1 ? (
        <div className="wishes-pager">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            {gb.pagerPrev}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          >
            {gb.pagerNext}
          </button>
        </div>
      ) : null}
    </section>
  );
}
