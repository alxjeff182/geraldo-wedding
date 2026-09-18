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

type CloseReason = "ui" | "gesture" | "history";

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

/** Left-edge back swipe (finger moves right), same direction as system back. */
const EDGE_PX = 28;
const EDGE_COMMIT_PX = 56;
/** In-panel horizontal dismiss toward the exit direction (off to the right). */
const PANEL_COMMIT_PX = 72;

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
  const closingRef = useRef(false);
  const wasOpenRef = useRef(false);
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);
  const closeModalRef = useRef<(reason: CloseReason) => void>(() => {});
  const [instantHide, setInstantHide] = useState(false);

  openRef.current = open;
  onCloseRef.current = onClose;

  /**
   * Unified close pipeline for UI / gesture / history.
   * Gesture commits close immediately (no hide-only preempt, no restore timer).
   */
  const closeModal = (reason: CloseReason) => {
    if (closingRef.current) return;
    if (!openRef.current && !historyPushedRef.current) return;

    closingRef.current = true;

    const instant = reason === "gesture" || reason === "history";
    if (instant) {
      hideModalElement(modalRef.current);
      flushSync(() => setInstantHide(true));
    }

    if (reason === "history") {
      historyPushedRef.current = false;
      onCloseRef.current();
      return;
    }

    // ui + gesture: sync history ourselves; ignore the matching popstate.
    if (historyPushedRef.current) {
      ignoreNextPopRef.current = true;
      historyPushedRef.current = false;
      window.history.back();
    }

    onCloseRef.current();
  };

  closeModalRef.current = closeModal;

  // Stable popstate + swipe detection for component lifetime.
  useEffect(() => {
    const onPopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }
      closeModalRef.current("history");
    };

    let tracking: null | {
      mode: "edge" | "panel";
      startX: number;
      startY: number;
    } = null;

    const onTouchStart = (event: TouchEvent) => {
      if (!openRef.current || closingRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;

      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, [contenteditable=true]")
      ) {
        tracking = null;
        return;
      }

      if (touch.clientX <= EDGE_PX) {
        tracking = { mode: "edge", startX: touch.clientX, startY: touch.clientY };
        return;
      }

      if (modalRef.current?.contains(target instanceof Node ? target : null)) {
        tracking = { mode: "panel", startX: touch.clientX, startY: touch.clientY };
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking || !openRef.current || closingRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - tracking.startX;
      const dy = touch.clientY - tracking.startY;

      // Vertical scroll wins — abort horizontal dismiss tracking.
      if (Math.abs(dy) > 36 && Math.abs(dy) > Math.abs(dx)) {
        tracking = null;
        return;
      }

      if (tracking.mode === "edge" && dx >= EDGE_COMMIT_PX) {
        tracking = null;
        closeModalRef.current("gesture");
        return;
      }

      // Panel dismiss: drag toward exit (right / positive x).
      if (tracking.mode === "panel" && dx >= PANEL_COMMIT_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
        tracking = null;
        closeModalRef.current("gesture");
      }
    };

    const onTouchEnd = () => {
      // Cancelled swipe: do nothing. Never schedule a restore / reopen.
      tracking = null;
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (!open || !modalId) {
      wasOpenRef.current = false;
      closingRef.current = false;
      return;
    }

    // Reset hide flag only on fresh open (false → true).
    if (!wasOpenRef.current) {
      setInstantHide(false);
      ignoreNextPopRef.current = false;
      closingRef.current = false;
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
        closeModalRef.current("ui");
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
              onClick={() => closeModal("ui")}
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
