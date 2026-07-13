import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase, isSupabaseConfigured, type Wish } from "../../lib/supabase";
import { submitForm } from "../../lib/submit-form";
import { useWeddingContent } from "../../context/WeddingContentContext";

type Props = {
  guestId: string | null;
  onSuccess: (message: string) => void;
};

export function Guestbook({ guestId, onSuccess }: Props) {
  const { content } = useWeddingContent();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const loadWishes = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: wishData } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (wishData) setWishes(wishData);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadWishes();

    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("wedding-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, () => {
        void loadWishes();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadWishes]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !message) return;

    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement)?.value ?? "";

    setSubmitting(true);

    const result = await submitForm({
      type: "wish",
      honeypot,
      payload: {
        guest_id: guestId,
        name: name.trim(),
        message: message.trim(),
      },
      messages: content.guestbook,
    });

    setSubmitting(false);

    if (!result.ok) {
      onSuccess(result.error ?? content.guestbook.errorMessage);
      return;
    }

    onSuccess(result.message ?? content.guestbook.successMessage);
    setName("");
    setMessage("");
    void loadWishes();
  };

  const paged = wishes.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(wishes.length / pageSize));

  return (
    <section className="section-guestbook-wrap" aria-labelledby="guestbook-heading">
      <div className="guestbook-arch">
        <img
          src={content.media.bunga}
          alt=""
          className="guestbook-bunga guestbook-bunga--left"
          loading="lazy"
          width={170}
          height={180}
          aria-hidden
        />
        <img
          src={content.media.bunga}
          alt=""
          className="guestbook-bunga guestbook-bunga--right"
          loading="lazy"
          width={170}
          height={180}
          aria-hidden
        />

        <h2 id="guestbook-heading" className="guestbook-title">
          {content.guestbook.title}
        </h2>
        <p className="guestbook-subtitle">{content.guestbook.subtitle}</p>

        <div className="cui-panel">
          <form className="cui-form" onSubmit={(e) => void handleSubmit(e)}>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="sr-only"
              aria-hidden
            />

            <label className="cui-field">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={content.guestbook.namePlaceholder}
                maxLength={200}
                className="cui-field__input"
              />
              <span className="cui-field__required" aria-hidden>
                *
              </span>
            </label>

            <label className="cui-field cui-field--textarea">
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={content.guestbook.messagePlaceholder}
                rows={2}
                maxLength={2000}
                className="cui-field__textarea"
              />
              <span className="cui-field__required" aria-hidden>
                *
              </span>
            </label>

            <button type="submit" className="cui-submit" disabled={submitting}>
              {submitting ? content.guestbook.submitting : content.guestbook.submit}
            </button>
          </form>

          <div className="cui-comments">
            {loading ? (
              <div className="cui-comments__loading" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="cui-comments__skeleton" />
                ))}
              </div>
            ) : wishes.length === 0 ? (
              <p className="cui-comments__empty">
                {isSupabaseConfigured
                  ? content.guestbook.emptyMessage
                  : content.guestbook.emptyNoSupabase}
              </p>
            ) : (
              <>
                <ul className="cui-comments__list">
                  {paged.map((wish) => (
                    <li key={wish.id} className="cui-comments__item">
                      <p className="cui-comments__name">{wish.name}</p>
                      <p className="cui-comments__message">{wish.message}</p>
                    </li>
                  ))}
                </ul>
                {totalPages > 1 && (
                  <div className="cui-comments__pager">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      {content.guestbook.pagerPrev}
                    </button>
                    <span>
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {content.guestbook.pagerNext}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
