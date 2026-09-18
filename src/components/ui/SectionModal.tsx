import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { OPEN_EASE } from "../../constants/open-animation";
import type { HeroShortcutId } from "../../types/hero-shortcut";
import { ClockIcon } from "./ClockIcon";
import { LocationIcon } from "./LocationIcon";
import { RsvpIcon } from "./RsvpIcon";

type Props = {
  open: boolean;
  title: string;
  modalId: HeroShortcutId | null;
  onClose: () => void;
  children: ReactNode;
};

const PAGE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 32,
  mass: 0.95,
};

const EXIT_EASE = [0.4, 0, 0.2, 1] as const;

const panelVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: PAGE_SPRING,
  },
  exit: {
    x: "100%",
    transition: { duration: 0.38, ease: EXIT_EASE },
  },
};

const instantExit = {
  x: "100%",
  opacity: 0,
  transition: { duration: 0 },
};

const headerVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.08, duration: 0.35, ease: OPEN_EASE },
  },
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { delay: 0.14, duration: 0.4, ease: OPEN_EASE },
  },
};

const bodyVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.1, duration: 0.4, ease: OPEN_EASE },
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: 0.2, ease: EXIT_EASE },
  },
};

const MODAL_ICONS: Record<HeroShortcutId, typeof ClockIcon> = {
  countdown: ClockIcon,
  events: LocationIcon,
  rsvp: RsvpIcon,
};

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.5 5 8 11.5 14.5 18"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function hideModalElement(el: HTMLElement | null) {
  if (!el) return;
  el.style.visibility = "hidden";
  el.style.pointerEvents = "none";
  el.style.opacity = "0";
}

export function SectionModal({ open, title, modalId, onClose, children }: Props) {
  const Icon = modalId ? MODAL_ICONS[modalId] : null;
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const historyPushedRef = useRef(false);
  const ignoreNextPopRef = useRef(false);
  const wasOpenRef = useRef(false);
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);
  const [instantHide, setInstantHide] = useState(false);

  openRef.current = open;
  onCloseRef.current = onClose;

  /** Close via UI: sync history first so the stable popstate listener can clear ignoreNextPop. */
  const closeFromUi = () => {
    if (historyPushedRef.current) {
      ignoreNextPopRef.current = true;
      historyPushedRef.current = false;
      // history.back() must run while the popstate listener is still mounted,
      // otherwise ignoreNextPop stays stuck and the next hardware back is eaten.
      window.history.back();
    }

    onClose();
  };

  // Single close path for swipe-back / hardware back. No touch preempt + restore
  // timer — that race was the reopen flicker (hidden → setInstantHide(false) →
  // visible → popstate close).
  useEffect(() => {
    const onPopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }

      if (!historyPushedRef.current && !openRef.current) return;

      historyPushedRef.current = false;
      hideModalElement(modalRef.current);

      flushSync(() => {
        setInstantHide(true);
        onCloseRef.current();
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!open || !modalId) {
      wasOpenRef.current = false;
      return;
    }

    // Only clear instantHide on a fresh open (false → true), never while a
    // history/gesture close is in flight.
    if (!wasOpenRef.current) {
      setInstantHide(false);
      ignoreNextPopRef.current = false;
    }
    wasOpenRef.current = true;

    if (historyPushedRef.current) {
      window.history.replaceState({ sectionModal: modalId }, "");
    } else {
      window.history.pushState({ sectionModal: modalId }, "");
      historyPushedRef.current = true;
    }
  }, [open, modalId]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFromUi();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";
    window.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>(".section-modal__back")?.focus();
    }, 120);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflowY = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && modalId && (
        <motion.div
          key={modalId}
          ref={modalRef}
          className="section-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit={instantHide ? instantExit : "exit"}
          style={instantHide ? { pointerEvents: "none", visibility: "hidden", opacity: 0 } : undefined}
        >
          <motion.header
            className="section-modal__header"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              type="button"
              className="section-modal__back"
              onClick={closeFromUi}
              aria-label="Kembali"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: OPEN_EASE }}
              whileTap={{ scale: 0.94, x: -2 }}
            >
              <BackIcon />
              <span>Kembali</span>
            </motion.button>

            <div className="section-modal__title-wrap">
              {Icon && (
                <motion.span
                  className="section-modal__title-icon"
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.65 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.12, type: "spring", stiffness: 400, damping: 22 }}
                >
                  <Icon />
                </motion.span>
              )}
              <h2 className="section-modal__title">{title}</h2>
            </div>

            <span className="section-modal__header-spacer" aria-hidden />
          </motion.header>

          <motion.div
            className="section-modal__accent"
            aria-hidden
            variants={lineVariants}
            initial="hidden"
            animate="visible"
          />

          <motion.div
            className={`section-modal__body${modalId ? ` section-modal__body--${modalId}` : ""}`}
            variants={bodyVariants}
            initial="hidden"
            animate="visible"
            exit={instantHide ? { opacity: 0, transition: { duration: 0 } } : "exit"}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
