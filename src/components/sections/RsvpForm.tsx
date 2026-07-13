import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { OPEN_EASE } from "../../constants/open-animation";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useWeddingContent } from "../../context/WeddingContentContext";
import { submitForm } from "../../lib/submit-form";

type Props = {
  guestId: string | null;
  onSuccess: (message: string) => void;
  embedded?: boolean;
};

const EMBED_SPRING = { type: "spring" as const, stiffness: 380, damping: 26 };

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.16 + i * 0.08, duration: 0.4, ease: OPEN_EASE },
  }),
};

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function GuestCountPills({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const options = ["1", "2", "3"] as const;

  return (
    <div className="rsvp-count-pills" role="group" aria-label="Jumlah kehadiran">
      {options.map((count, index) => {
        const active = value === count;

        return (
          <motion.button
            key={count}
            type="button"
            className={`rsvp-count-pill${active ? " rsvp-count-pill--active" : ""}`}
            onClick={() => onChange(count)}
            aria-pressed={active}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28 + index * 0.06, ...EMBED_SPRING }}
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
          >
            {count}
          </motion.button>
        );
      })}
    </div>
  );
}

export function RsvpForm({ guestId, onSuccess, embedded = false }: Props) {
  const { content } = useWeddingContent();
  const [name, setName] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !guestCount) return;

    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement)?.value ?? "";

    setSubmitting(true);

    const result = await submitForm({
      type: "rsvp",
      honeypot,
      payload: {
        guest_id: guestId,
        name: name.trim(),
        guest_count: Number(guestCount),
        attendance: "hadir",
      },
    });

    setSubmitting(false);

    if (!result.ok) {
      onSuccess(result.error ?? "Gagal mengirim RSVP. Silakan coba lagi.");
      return;
    }

    onSuccess(result.message ?? "Terima kasih! Konfirmasi kehadiran Anda telah kami terima.");
    setName("");
    setGuestCount("");
  };

  const Wrapper = embedded ? "div" : "section";
  const FieldWrap = embedded ? motion.label : "label";

  return (
    <Wrapper
      {...(!embedded ? { id: "rsvp" } : {})}
      className={`section-rsvp-wrap${embedded ? " section-rsvp-wrap--embedded" : ""}`}
      aria-labelledby="rsvp-heading"
    >
      <motion.div
        className={`section-card${embedded ? " section-card--embedded" : ""}`}
        {...(embedded
          ? {
              initial: { opacity: 0, scale: 0.97 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.42, ease: OPEN_EASE },
            }
          : {})}
      >
        <motion.div
          className={embedded ? "rsvp-embedded-intro" : undefined}
          {...(embedded
            ? {
                initial: { opacity: 0, y: -10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.06, duration: 0.4, ease: OPEN_EASE },
              }
            : {})}
        >
          <h2 id="rsvp-heading" className="section-card__title">
            Rsvp
          </h2>
          <p className="section-card__subtitle">
            Konfirmasi kehadiran Anda dengan mengisi form berikut
          </p>
        </motion.div>

        {!isSupabaseConfigured && (
          <p className="sr-only">
            Supabase belum dikonfigurasi — set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
          </p>
        )}

        <form
          className={`wedding-form${embedded ? " wedding-form--embedded" : ""}`}
          onSubmit={(e) => void handleSubmit(e)}
        >
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="sr-only"
            aria-hidden
          />

          <FieldWrap
            className={`wedding-field${focusedField === "name" ? " wedding-field--focused" : ""}`}
            {...(embedded
              ? {
                  custom: 0,
                  variants: fieldVariants,
                  initial: "hidden",
                  animate: "visible",
                }
              : {})}
          >
            <span className="wedding-field__label">Nama*</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              placeholder="Nama Anda"
              className="wedding-field__input"
            />
          </FieldWrap>

          {embedded ? (
            <motion.div
              className="wedding-field wedding-field--pills"
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <span className="wedding-field__label">Jumlah Kehadiran*</span>
              <GuestCountPills value={guestCount} onChange={setGuestCount} />
              <input
                type="text"
                required
                value={guestCount}
                onChange={() => undefined}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
              />
            </motion.div>
          ) : (
            <label className="wedding-field">
              <span className="wedding-field__label">Jumlah Kehadiran*</span>
              <select
                required
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="wedding-field__select"
              >
                <option value="">Pilih</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </label>
          )}

          {embedded ? (
            <motion.button
              type="submit"
              className="btn-submit btn-submit--interactive"
              disabled={submitting}
              custom={2}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={submitting ? undefined : { scale: 1.03, y: -2 }}
              whileTap={submitting ? undefined : { scale: 0.96 }}
              transition={EMBED_SPRING}
            >
              <span className="btn-submit__shine" aria-hidden />
              <motion.span
                className="btn-submit__icon"
                animate={submitting ? { x: [0, 3, 0] } : { x: 0 }}
                transition={{ repeat: submitting ? Infinity : 0, duration: 0.6 }}
              >
                <SendIcon />
              </motion.span>
              {submitting ? "Mengirim..." : "Submit"}
            </motion.button>
          ) : (
            <button type="submit" className="btn-submit" disabled={submitting}>
              <SendIcon />
              {submitting ? "Mengirim..." : "Submit"}
            </button>
          )}
        </form>

        <motion.p
          className="section-card__note"
          {...(embedded
            ? {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { delay: 0.48, duration: 0.35 },
              }
            : {})}
        >
          {content.rsvp.note}
        </motion.p>

        {embedded && (
          <motion.img
            src={content.media.divider}
            alt=""
            className="divider-img rsvp-divider--embedded"
            loading="lazy"
            width={320}
            height={74}
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: 0.85, scaleX: 1 }}
            transition={{ delay: 0.42, duration: 0.45, ease: OPEN_EASE }}
          />
        )}
      </motion.div>
    </Wrapper>
  );
}
