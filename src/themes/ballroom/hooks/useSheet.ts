import { useCallback, useEffect, useRef, useState } from "react";

export type SheetId = "rsvp" | "location" | "gift" | null;

type UseSheetOptions = {
  inertTargets?: Array<HTMLElement | null>;
};

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

  return { activeId, open, close, setSheetRef, isOpen: Boolean(activeId) };
}
