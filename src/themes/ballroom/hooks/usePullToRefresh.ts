import { useEffect, useRef, useState, type RefObject } from "react";

const PULL_RESISTANCE = 0.42;
const PULL_MAX = 112;
const REFRESH_AT = 72;

type Options = {
  /** When true, pull-to-refresh is disabled (e.g. sheet open). */
  blocked?: boolean;
};

/**
 * Pull down at the top of a scroll root to reload the page.
 * Uses touch only — invitation already sets overscroll-behavior: contain.
 */
export function usePullToRefresh(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  { blocked = false }: Options = {},
) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || blocked || refreshing) return;

    let startY = 0;
    let tracking = false;
    let armed = false;

    const setDistance = (value: number) => {
      pullRef.current = value;
      setPull(value);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (root.scrollTop > 1) {
        tracking = false;
        return;
      }
      startY = event.touches[0]?.clientY ?? 0;
      tracking = true;
      armed = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking) return;
      if (root.scrollTop > 1) {
        tracking = false;
        armed = false;
        setDistance(0);
        return;
      }

      const currentY = event.touches[0]?.clientY ?? startY;
      const raw = currentY - startY;
      if (raw <= 0) {
        armed = false;
        setDistance(0);
        return;
      }

      armed = true;
      const next = Math.min(raw * PULL_RESISTANCE, PULL_MAX);
      setDistance(next);
      if (next > 6) event.preventDefault();
    };

    const onTouchEnd = () => {
      if (!tracking) return;
      tracking = false;
      const distance = pullRef.current;
      armed = false;
      if (distance >= REFRESH_AT) {
        setRefreshing(true);
        setDistance(REFRESH_AT);
        window.location.reload();
        return;
      }
      setDistance(0);
    };

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    root.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
      if (!armed) setDistance(0);
    };
  }, [rootRef, enabled, blocked, refreshing]);

  useEffect(() => {
    if (blocked || !enabled) {
      pullRef.current = 0;
      setPull(0);
    }
  }, [blocked, enabled]);

  return {
    pull,
    refreshing,
    armed: pull >= REFRESH_AT,
    progress: Math.min(pull / REFRESH_AT, 1),
  };
}
