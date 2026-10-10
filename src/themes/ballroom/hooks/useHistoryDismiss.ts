import { useEffect, useRef } from "react";

/**
 * While `open` is true, push a history entry so the browser/Android back
 * button closes the overlay instead of leaving the page.
 */
export function useHistoryDismiss(open: boolean, onCloseFromHistory: () => void) {
  const pushedRef = useRef(false);
  const closingViaPopRef = useRef(false);
  const onCloseRef = useRef(onCloseFromHistory);
  onCloseRef.current = onCloseFromHistory;

  useEffect(() => {
    if (open) {
      if (!pushedRef.current) {
        window.history.pushState({ __ballroomOverlay: true }, "");
        pushedRef.current = true;
      }
      return;
    }

    if (!pushedRef.current) return;
    if (closingViaPopRef.current) {
      closingViaPopRef.current = false;
      pushedRef.current = false;
      return;
    }
    pushedRef.current = false;
    window.history.back();
  }, [open]);

  useEffect(() => {
    const onPopState = () => {
      if (!pushedRef.current) return;
      closingViaPopRef.current = true;
      pushedRef.current = false;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
