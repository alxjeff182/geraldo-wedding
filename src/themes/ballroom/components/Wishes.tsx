import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
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

const INITIAL_VISIBLE = 8;
const LOAD_MORE = 8;
const POLL_MS = 30_000;
const LONG_MSG_CHARS = 140;

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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function avatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

function guardMessage(
  reason: string,
  gb: {
    limitReachedMessage: string;
    errorMessage: string;
  },
): string {
  if (reason === "limit_reached") return gb.limitReachedMessage;
  if (reason === "too_fast") return "Mohon tunggu sebentar sebelum mengirim.";
  if (reason === "link" || reason === "phone") {
    return "Ucapan berisi tautan atau nomor tidak diperbolehkan.";
  }
  if (reason === "profanity") return "Ucapan mengandung kata yang tidak pantas.";
  if (reason === "too_short") return "Ucapan terlalu pendek.";
  if (reason === "too_long") return "Ucapan terlalu panjang (maks. 500 karakter).";
  if (reason === "empty") return "Ucapan tidak boleh kosong.";
  if (reason === "repeat") return "Ucapan sama dengan sebelumnya.";
  return gb.errorMessage;
}

export function Wishes({ guestId, guestName, onToast }: Props) {
  const { content } = useWeddingContent();
  const gb = content.guestbook;
  const guestKey = guestId;
  const formOpenedAt = useRef(Date.now());
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Wish[]>([]);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [fadeEdge, setFadeEdge] = useState({ top: false, bottom: false });
  const [name, setName] = useState(guestName.trim());
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

  useEffect(() => {
    if (guestName.trim()) setName(guestName.trim());
  }, [guestName]);

  const fetchWishes = useCallback(() => {
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
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

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
  }, [inView, fetchWishes]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && inView) {
        fetchWishes();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [inView, fetchWishes]);

  const updateFadeEdge = useCallback(() => {
    const el = listRef.current;
    if (!el) {
      setFadeEdge({ top: false, bottom: false });
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight > clientHeight + 2;
    setFadeEdge({
      top: overflow && scrollTop > 4,
      bottom: overflow && scrollTop + clientHeight < scrollHeight - 4,
    });
  }, []);

  useEffect(() => {
    updateFadeEdge();
  }, [items, visible, updateFadeEdge]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => updateFadeEdge();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScroll) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro?.disconnect();
    };
  }, [updateFadeEdge]);

  useEffect(() => {
    const root = listRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const rows = root.querySelectorAll<HTMLElement>(".wish-row:not(.is-in)");
    if (rows.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { root, threshold: 0.2 },
    );
    rows.forEach((row) => io.observe(row));
    return () => io.disconnect();
  }, [items, visible]);

  useEffect(() => {
    if (!freshId) return;
    const id = window.setTimeout(() => setFreshId(null), 1800);
    return () => window.clearTimeout(id);
  }, [freshId]);

  const slice = items.slice(0, visible);
  const hasMore = visible < items.length;
  const remaining = Math.max(0, WISH_MAX_PER_GUEST - sentCount);
  const canSubmit = remaining > 0;
  const countLabel = (gb.countLabel ?? "{n} ucapan").replace("{n}", String(items.length));
  const loadMoreLabel = gb.loadMore ?? "Lihat lebih banyak";
  const displayName = (guestId ? guestName : name).trim();

  const onLoadMore = () => {
    setVisible((n) => Math.min(items.length, n + LOAD_MORE));
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (!el) return;
      el.scrollBy({ top: 72, behavior: "smooth" });
      updateFadeEdge();
    });
  };

  const toggleExpand = (id: string, long: boolean) => {
    if (!long) return;
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const submitName = displayName;
    if (!submitName) {
      onToast("Nama wajib diisi.");
      return;
    }

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
        name: submitName,
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

    const localId = crypto.randomUUID();
    markWishSubmitted(guestKey);
    setSentCount(getWishCount(guestKey));
    onToast(result.message ?? gb.successMessage);
    setItems((prev) => [
      {
        id: localId,
        guest_id: guestId,
        name: submitName,
        message: message.trim(),
        attendance: null,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setFreshId(localId);
    setVisible(INITIAL_VISIBLE);
    setMessage("");
    formOpenedAt.current = Date.now();
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    fetchWishes();
  };

  const fadeClass = [
    "wishes-feed__list",
    fadeEdge.top ? "is-fade-top" : "",
    fadeEdge.bottom ? "is-fade-bottom" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={sectionRef}
      id="wishes"
      className="section wishes-mod fade-up"
      aria-label={gb.title}
    >
      <div className="section__head">
        <p className="eyebrow">wishes</p>
        <h3>{gb.title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <p className="gift__lead">{gb.subtitle}</p>

      {canSubmit ? (
        <form className="wishes-form sheet-form" noValidate onSubmit={(e) => void onSubmit(e)}>
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
          {guestId ? (
            <div className="sheet-form__field">
              <span className="sheet-form__label">Nama</span>
              <p className="wishes-namechip">{guestName}</p>
            </div>
          ) : (
            <label className="sheet-form__field">
              <span className="sheet-form__label">Nama</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={gb.namePlaceholder ?? "Nama Anda"}
                required
                maxLength={80}
              />
            </label>
          )}
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
        <p className="wishes-locked">{gb.limitReachedMessage}</p>
      )}

      {items.length === 0 ? (
        <p className="gift__lead">{supabaseOk ? gb.emptyMessage : gb.emptyNoSupabase}</p>
      ) : (
        <div className="wishes-feed">
          <div className="wishes-feed__head">
            <p className="wishes-feed__count">{countLabel}</p>
            <p className="wishes-feed__live">
              <span className="wishes-feed__dot" aria-hidden="true" />
              Terbaru
            </p>
          </div>
          <div ref={listRef} className={fadeClass}>
            {slice.map((wish, index) => {
              const long = wish.message.trim().length > LONG_MSG_CHARS;
              const expanded = expandedId === wish.id;
              const hue = avatarHue(wish.name);
              return (
                <article
                  key={wish.id}
                  className={`wish-row${freshId === wish.id ? " is-fresh" : ""}${expanded ? " is-expanded" : ""}`}
                  style={{ "--i": index % LOAD_MORE } as CSSProperties}
                >
                  <div
                    className="wish-row__avatar"
                    style={{ "--hue": hue } as CSSProperties}
                    aria-hidden="true"
                  >
                    {initials(wish.name)}
                  </div>
                  <div className="wish-row__body">
                    <div className="wish-row__meta">
                      <p className="wish-row__name">{wish.name}</p>
                      <time className="wish-row__time" dateTime={wish.created_at}>
                        {relativeTime(wish.created_at)}
                      </time>
                    </div>
                    {long ? (
                      <button
                        type="button"
                        className="wish-row__msg wish-row__msg--toggle"
                        aria-expanded={expanded}
                        onClick={() => toggleExpand(wish.id, long)}
                      >
                        {wish.message}
                      </button>
                    ) : (
                      <p className="wish-row__msg">{wish.message}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {hasMore ? (
            <button type="button" className="wishes-feed__more" onClick={onLoadMore}>
              <span>{loadMoreLabel}</span>
              <span className="wishes-feed__chevron" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
