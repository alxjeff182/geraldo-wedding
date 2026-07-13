import { motion } from "framer-motion";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { OPEN_EASE } from "../../constants/open-animation";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useWeddingContent } from "../../context/WeddingContentContext";
import { submitForm } from "../../lib/submit-form";
import {
  checkRsvpClientGuard,
  hasRsvpSubmitted,
  markRsvpSubmitted,
} from "../../lib/rsvp-spam-guard";

type Props = {
  guestId: string | null;
  onSuccess: (message: string) => void;
  embedded?: boolean;
};

type Attendance = "hadir" | "tidak_hadir" | "ragu";

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

function OptionPills<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="rsvp-count-pills" role="group" aria-label={ariaLabel}>
      {options.map((option, index) => {
        const active = value === option.value;

        return (
          <motion.button
            key={option.value}
            type="button"
            className={`rsvp-count-pill${active ? " rsvp-count-pill--active" : ""}`}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28 + index * 0.06, ...EMBED_SPRING }}
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export function RsvpForm({ guestId, onSuccess, embedded = false }: Props) {
  const { content } = useWeddingContent();
  const formOpenedAt = useRef(Date.now());
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("hadir");
  const [guestCount, setGuestCount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(() => hasRsvpSubmitted(guestId));

  useEffect(() => {
    const syncSubmitted = () => setAlreadySubmitted(hasRsvpSubmitted(guestId));
    syncSubmitted();
    window.addEventListener("storage", syncSubmitted);
    return () => window.removeEventListener("storage", syncSubmitted);
  }, [guestId]);

  const guardMessage = (reason: "already_submitted" | "too_fast" | "spam_name") => {
    if (reason === "already_submitted") return content.rsvp.alreadySubmittedMessage;
    if (reason === "too_fast") return content.rsvp.tooFastMessage;
    return content.rsvp.spamNameMessage;
  };

  const attendanceOptions: { value: Attendance; label: string }[] = [
    { value: "hadir", label: content.rsvp.attendanceHadir },
    { value: "tidak_hadir", label: content.rsvp.attendanceTidak },
    { value: "ragu", label: content.rsvp.attendanceRagu },
  ];

  const showGuestCount = attendance !== "tidak_hadir";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (alreadySubmitted || submitting) return;
    if (!name || (showGuestCount && !guestCount)) return;

    const guard = checkRsvpClientGuard(guestId, formOpenedAt.current, name);
    if (!guard.allowed) {
      onSuccess(guardMessage(guard.reason) ?? content.rsvp.errorMessage);
      if (guard.reason === "already_submitted") setAlreadySubmitted(true);
      return;
    }

    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement)?.value ?? "";
    const companyHoneypot =
      (e.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value ?? "";

    setSubmitting(true);

    const result = await submitForm({
      type: "rsvp",
      honeypot,
      companyHoneypot,
      formOpenedAt: formOpenedAt.current,
      payload: {
        guest_id: guestId,
        name: name.trim(),
        guest_count: showGuestCount ? Number(guestCount) : 1,
        attendance,
      },
      messages: content.rsvp,
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.error?.includes("sudah pernah dikirim")) {
        markRsvpSubmitted(guestId);
        setAlreadySubmitted(true);
      }
      onSuccess(result.error ?? content.rsvp.errorMessage);
      return;
    }

    markRsvpSubmitted(guestId);
    setAlreadySubmitted(true);
    onSuccess(result.message ?? content.rsvp.successMessage);
    setName("");
    setAttendance("hadir");
    setGuestCount("");
  };

  const Wrapper = embedded ? "div" : "section";
  const FieldWrap = embedded ? motion.label : "label";
  const MotionDiv = embedded ? motion.div : "div";

  const attendanceField = embedded ? (
    <MotionDiv
      className="wedding-field wedding-field--pills"
      custom={1}
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="wedding-field__label">{content.rsvp.attendanceLabel}</span>
      <OptionPills
        value={attendance}
        onChange={setAttendance}
        options={attendanceOptions}
        ariaLabel={content.rsvp.attendanceAriaLabel}
      />
    </MotionDiv>
  ) : (
    <label className="wedding-field">
      <span className="wedding-field__label">{content.rsvp.attendanceLabel}</span>
      <select
        required
        value={attendance}
        onChange={(e) => setAttendance(e.target.value as Attendance)}
        className="wedding-field__select"
      >
        {attendanceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  const guestCountField = showGuestCount ? (
    embedded ? (
      <MotionDiv
        className="wedding-field wedding-field--pills"
        custom={2}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
      >
        <span className="wedding-field__label">{content.rsvp.guestCountLabel}</span>
        <OptionPills
          value={guestCount}
          onChange={setGuestCount}
          options={content.rsvp.guestCountOptions.map((count) => ({ value: count, label: count }))}
          ariaLabel={content.rsvp.guestCountAriaLabel}
        />
        <input
          type="text"
          required
          value={guestCount}
          onChange={() => undefined}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
      </MotionDiv>
    ) : (
      <label className="wedding-field">
        <span className="wedding-field__label">{content.rsvp.guestCountLabel}</span>
        <select
          required
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          className="wedding-field__select"
        >
          <option value="">{content.rsvp.guestCountPlaceholder}</option>
          {content.rsvp.guestCountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    )
  ) : null;

  const submitButtonIndex = showGuestCount ? 3 : 2;

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
            {content.rsvp.title}
          </h2>
          <p className="section-card__subtitle">{content.rsvp.subtitle}</p>
        </motion.div>

        {!isSupabaseConfigured && (
          <p className="sr-only">
            Supabase belum dikonfigurasi — set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
          </p>
        )}

        {alreadySubmitted ? (
          <p className="section-card__note section-card__note--success" role="status">
            {content.rsvp.alreadySubmittedMessage}
          </p>
        ) : (
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
          <input
            type="text"
            name="company"
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
            <span className="wedding-field__label">{content.rsvp.nameLabel}</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              placeholder={content.rsvp.namePlaceholder}
              className="wedding-field__input"
            />
          </FieldWrap>

          {attendanceField}
          {guestCountField}

          {embedded ? (
            <motion.button
              type="submit"
              className="btn-submit btn-submit--interactive"
              disabled={submitting}
              custom={submitButtonIndex}
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
              {submitting ? content.rsvp.submitting : content.rsvp.submit}
            </motion.button>
          ) : (
            <button type="submit" className="btn-submit" disabled={submitting}>
              <SendIcon />
              {submitting ? content.rsvp.submitting : content.rsvp.submit}
            </button>
          )}
        </form>
        )}

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
