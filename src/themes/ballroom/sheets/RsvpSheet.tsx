import { useEffect, useRef, useState, type FormEvent } from "react";
import { useWeddingContent } from "../../../context/WeddingContentContext";
import { submitForm } from "../../../lib/submit-form";
import {
  checkRsvpClientGuard,
  hasRsvpSubmitted,
  markRsvpSubmitted,
} from "../../../lib/rsvp-spam-guard";
import {
  formatRsvpDeadlineLabel,
  isRsvpDeadlinePassed,
} from "../../../lib/rsvp-deadline";
import {
  buildGuestWhatsAppUrl,
  buildRsvpWhatsappMessage,
} from "../../../lib/guest-whatsapp";
import { IconCheck, IconMail, IconSuccess, IconWhatsApp, IconX } from "../icons";

type Attendance = "hadir" | "tidak_hadir";

type Props = {
  open: boolean;
  guestId: string | null;
  guestName: string;
  onClose: () => void;
  setSheetRef: (el: HTMLElement | null) => void;
  onToast: (msg: string) => void;
};

export function RsvpSheet({
  open,
  guestId,
  guestName,
  onClose,
  setSheetRef,
  onToast,
}: Props) {
  const { content } = useWeddingContent();
  const rsvp = content.rsvp;
  const formOpenedAt = useRef(Date.now());
  const [name, setName] = useState(guestName);
  const [attendance, setAttendance] = useState<Attendance>("hadir");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(() => hasRsvpSubmitted(guestId));
  const [waHref, setWaHref] = useState<string | null>(null);

  const deadlinePassed = isRsvpDeadlinePassed(rsvp.deadline);
  const deadlineHint = formatRsvpDeadlineLabel(rsvp.deadlineLabel, rsvp.deadline);
  const maxGuests = Math.max(
    1,
    ...(rsvp.guestCountOptions?.map((o) => Number(o)).filter(Boolean) ?? [5]),
  );

  useEffect(() => {
    setName(guestName);
  }, [guestName]);

  useEffect(() => {
    if (open) formOpenedAt.current = Date.now();
  }, [open]);

  const attendanceLabel = (value: Attendance) => {
    if (value === "hadir") return rsvp.attendanceHadir;
    return rsvp.attendanceTidak;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || deadlinePassed) return;

    const guard = checkRsvpClientGuard(guestId, formOpenedAt.current, name);
    if (!guard.allowed) {
      const msg =
        guard.reason === "already_submitted"
          ? rsvp.alreadySubmittedMessage
          : guard.reason === "too_fast"
            ? rsvp.tooFastMessage
            : rsvp.spamNameMessage;
      onToast(msg);
      return;
    }

    setSubmitting(true);
    const result = await submitForm({
      type: "rsvp",
      honeypot: "",
      companyHoneypot: "",
      formOpenedAt: formOpenedAt.current,
      payload: {
        guest_id: guestId,
        name: name.trim(),
        attendance,
        guest_count: attendance === "tidak_hadir" ? 1 : guests,
      },
      messages: {
        successMessage: rsvp.successMessage,
        localSuccessMessage: rsvp.localSuccessMessage,
        networkErrorMessage: rsvp.networkErrorMessage,
        supabaseErrorMessage: rsvp.supabaseErrorMessage,
      },
    });
    setSubmitting(false);

    if (!result.ok) {
      onToast(result.error ?? rsvp.errorMessage);
      return;
    }

    markRsvpSubmitted(guestId);
    setDone(true);

    if (content.contact.rsvpWhatsappEnabled && content.contact.whatsappNumber) {
      const href = buildGuestWhatsAppUrl(
        content.contact.whatsappNumber,
        buildRsvpWhatsappMessage(content.contact.rsvpWhatsappTemplate, {
          nama: name.trim(),
          kehadiran: attendanceLabel(attendance),
          jumlah: String(attendance === "tidak_hadir" ? 1 : guests),
          ucapan: message.trim(),
          pasangan: content.site.title,
        }),
      );
      setWaHref(href);
    }
  };

  return (
    <section
      ref={setSheetRef}
      className={`sheet${open ? " is-open" : ""}`}
      id="sheet-rsvp"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheetRsvpTitle"
      tabIndex={-1}
      hidden={!open}
    >
      <div className="sheet__handle" aria-hidden="true" />
      <button type="button" className="sheet__close" aria-label="Tutup" onClick={onClose}>
        ×
      </button>
      <header className="sheet__head">
        <span className="sheet__badge" aria-hidden="true">
          <IconMail size={18} />
        </span>
        <p className="eyebrow">Konfirmasi Kehadiran</p>
        <h3 id="sheetRsvpTitle">{rsvp.title}</h3>
        <p className="sheet__sub">{deadlineHint || rsvp.subtitle}</p>
      </header>
      <div className="sheet__body">
        {done ? (
          <div className="sheet-success">
            <div className="sheet-success__icon" aria-hidden="true">
              <IconSuccess />
            </div>
            <p className="sheet-success__title">
              {name.trim() ? `Terima kasih, ${name.trim()}` : "Terima kasih"}
            </p>
            <p className="sheet-success__text">{rsvp.successMessage}</p>
            {waHref ? (
              <a className="btn btn--wa sheet__cta" href={waHref} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp />
                <span>Kirim juga via WhatsApp</span>
              </a>
            ) : null}
            <button type="button" className="btn btn--ghost sheet__cta" onClick={onClose}>
              Tutup
            </button>
          </div>
        ) : (
          <form className="sheet-form" id="sheetRsvpForm" onSubmit={(e) => void onSubmit(e)}>
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              style={{ display: "none" }}
              aria-hidden="true"
            />
            <fieldset className="choice" role="radiogroup" aria-label={rsvp.attendanceAriaLabel}>
              <legend className="sheet-form__label">{rsvp.attendanceLabel}</legend>
              <div className="choice__row">
                <label className="choice__pill">
                  <input
                    type="radio"
                    name="attendance"
                    value="hadir"
                    checked={attendance === "hadir"}
                    onChange={() => setAttendance("hadir")}
                  />
                  <span>
                    <IconCheck />
                    {rsvp.attendanceHadir}
                  </span>
                </label>
                <label className="choice__pill">
                  <input
                    type="radio"
                    name="attendance"
                    value="tidak_hadir"
                    checked={attendance === "tidak_hadir"}
                    onChange={() => setAttendance("tidak_hadir")}
                  />
                  <span>
                    <IconX />
                    {rsvp.attendanceTidak}
                  </span>
                </label>
              </div>
            </fieldset>
            <label className="sheet-form__field">
              <span className="sheet-form__label">{rsvp.nameLabel}</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={rsvp.namePlaceholder}
                autoComplete="name"
              />
            </label>
            {attendance !== "tidak_hadir" ? (
              <div className="sheet-form__field">
                <span className="sheet-form__label">{rsvp.guestCountLabel}</span>
                <div className="stepper">
                  <button
                    type="button"
                    className="stepper__btn"
                    aria-label="Kurangi"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  >
                    −
                  </button>
                  <input className="num" type="number" readOnly value={guests} aria-live="polite" />
                  <button
                    type="button"
                    className="stepper__btn"
                    aria-label="Tambah"
                    onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : null}
            <label className="sheet-form__field">
              <span className="sheet-form__label">Ucapan</span>
              <textarea
                rows={3}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis ucapan untuk kami…"
              />
              <span className="sheet-form__count">{message.length}/200</span>
            </label>
          </form>
        )}
      </div>
      {!done ? (
        <footer className="sheet__foot">
          <button
            type="submit"
            className="btn sheet__cta"
            form="sheetRsvpForm"
            disabled={submitting || deadlinePassed}
          >
            {submitting ? rsvp.submitting : rsvp.submit}
          </button>
        </footer>
      ) : null}
    </section>
  );
}
