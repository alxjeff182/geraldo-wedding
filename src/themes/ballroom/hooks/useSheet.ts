import { useCallback, useEffect, useRef, useState } from "react";
import { useHistoryDismiss } from "./useHistoryDismiss";

export type SheetId = "rsvp" | "location" | "gift" | null;

type UseSheetOptions = {
  inertTargets?: Array<HTMLElement | null>;
};

const SWIPE_CLOSE_PX = 88;

export function useSheet({ inertTargets = [] }: UseSheetOptions = {}) {
  const [activeId, setActiveId] = useState<SheetId>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const sheetRefs = useRef<Record<string, HTMLElement | null>>({});

  const setSheetRef = useCallback((id: string, el: HTMLElement | null) => {
    sheetRefs.current[id] = el;
  }, []);

  const setBackgroundInert = useCallback(
    (inert: boolean) => {
      inertTargets.forEach((el) => {
        if (!el) return;
        if (inert) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
      });
    },
    [inertTargets],
  );

  const getFocusable = (sheet: HTMLElement) =>
    [
      ...sheet.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);

  const close = useCallback(() => {
    setActiveId(null);
    setBackgroundInert(false);
    const focus = lastFocusRef.current;
    if (focus && typeof focus.focus === "function") {
      window.setTimeout(() => focus.focus({ preventScroll: true }), 50);
    }
  }, [setBackgroundInert]);

  const open = useCallback(
    (id: NonNullable<SheetId>) => {
      lastFocusRef.current = document.activeElement as HTMLElement | null;
      setActiveId(id);
      setBackgroundInert(true);
      window.requestAnimationFrame(() => {
        const sheet = sheetRefs.current[id];
        sheet?.focus?.({ preventScroll: true });
      });
    },
    [setBackgroundInert],
  );

  useHistoryDismiss(Boolean(activeId), close);

  useEffect(() => {
    if (!activeId) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const sheet = sheetRefs.current[activeId];
      if (!sheet) return;
      const nodes = getFocusable(sheet);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  // Horizontal swipe dismiss (vertical scroll still wins via touch-action: pan-y).
  useEffect(() => {
    if (!activeId) return;
    const sheet = sheetRefs.current[activeId];
    if (!sheet) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let axis: "x" | "y" | null = null;
    let pointerId: number | null = null;
    let suppressClick = false;

    const clearDrag = () => {
      sheet.classList.remove("is-dragging");
      sheet.style.transform = "";
      sheet.style.transition = "";
      tracking = false;
      axis = null;
      pointerId = null;
    };

    const blockNextClick = () => {
      suppressClick = true;
      const onClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
        sheet.removeEventListener("click", onClick, true);
      };
      sheet.addEventListener("click", onClick, true);
      window.setTimeout(() => {
        if (!suppressClick) return;
        suppressClick = false;
        sheet.removeEventListener("click", onClick, true);
      }, 400);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("input, textarea, select, iframe")) return;
      startX = e.clientX;
      startY = e.clientY;
      tracking = true;
      axis = null;
      pointerId = e.pointerId;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!tracking || pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!axis) {
        if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          axis = "x";
          sheet.classList.add("is-dragging");
          try {
            sheet.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        } else {
          tracking = false;
          axis = null;
          return;
        }
      }

      if (axis !== "x") return;
      e.preventDefault();
      sheet.style.transform = `translate3d(${dx}px, 0, 0)`;
    };

    const finishClose = (dx: number) => {
      const dir = dx < 0 ? -1 : 1;
      sheet.classList.remove("is-dragging");
      sheet.style.transition = "transform 0.18s var(--ease-out, ease-out)";
      sheet.style.transform = `translate3d(${dir * 110}%, 0, 0)`;
      blockNextClick();
      window.setTimeout(() => {
        clearDrag();
        close();
      }, 160);
      tracking = false;
      axis = null;
      pointerId = null;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      if (axis === "x") {
        const dx = e.clientX - startX;
        if (Math.abs(dx) >= SWIPE_CLOSE_PX) {
          finishClose(dx);
          return;
        }
      }
      clearDrag();
    };

    sheet.addEventListener("pointerdown", onPointerDown);
    sheet.addEventListener("pointermove", onPointerMove, { passive: false });
    sheet.addEventListener("pointerup", onPointerUp);
    sheet.addEventListener("pointercancel", onPointerUp);

    return () => {
      clearDrag();
      sheet.removeEventListener("pointerdown", onPointerDown);
      sheet.removeEventListener("pointermove", onPointerMove);
      sheet.removeEventListener("pointerup", onPointerUp);
      sheet.removeEventListener("pointercancel", onPointerUp);
    };
  }, [activeId, close]);

  return { activeId, open, close, setSheetRef, isOpen: Boolean(activeId) };
}
