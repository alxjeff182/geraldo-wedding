import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import type { AlertDialogState } from "../../lib/alert-dialog";

type Props = {
  alert: AlertDialogState | null;
  onClose: () => void;
};

const TONE_LABEL: Record<AlertDialogState["tone"], string> = {
  error: "Error",
  success: "Sukses",
  warning: "Peringatan",
  info: "Info",
};

export function AlertDialog({ alert, onClose }: Props) {
  const titleId = useId();
  const descId = useId();
  const actionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!alert) return;

    const previous = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => actionRef.current?.focus(), 40);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [alert, onClose]);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          className="alert-dialog"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="alert-dialog__backdrop"
            aria-label="Tutup dialog"
            onClick={onClose}
          />
          <motion.div
            className={`alert-dialog__panel alert-dialog__panel--${alert.tone}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="alert-dialog__glow" aria-hidden />
            <p className="alert-dialog__eyebrow">{TONE_LABEL[alert.tone]}</p>
            <h2 id={titleId} className="alert-dialog__title">
              {alert.title}
            </h2>
            <p id={descId} className="alert-dialog__message">
              {alert.message}
            </p>
            <div className="alert-dialog__actions">
              {alert.onAction ? (
                <>
                  <button type="button" className="alert-dialog__btn alert-dialog__btn--ghost" onClick={onClose}>
                    Tutup
                  </button>
                  <button
                    ref={actionRef}
                    type="button"
                    className="alert-dialog__btn alert-dialog__btn--primary"
                    onClick={() => {
                      const action = alert.onAction;
                      onClose();
                      action?.();
                    }}
                  >
                    {alert.actionLabel ?? "Coba lagi"}
                  </button>
                </>
              ) : (
                <button
                  ref={actionRef}
                  type="button"
                  className="alert-dialog__btn alert-dialog__btn--primary"
                  onClick={onClose}
                >
                  {alert.actionLabel ?? "Mengerti"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
