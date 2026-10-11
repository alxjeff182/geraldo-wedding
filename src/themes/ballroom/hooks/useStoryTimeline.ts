import { useEffect, type RefObject } from "react";

type Options = {
  sectionRef: RefObject<HTMLElement | null>;
  scrollRootRef?: RefObject<HTMLElement | null>;
  enabled?: boolean;
  count: number;
};

/**
 * Scroll-driven story timeline: fills the vertical line via --fill (0..1)
 * and toggles .is-on / .is-in on each milestone as it crosses ~60% viewport.
 */
export function useStoryTimeline({ sectionRef, scrollRootRef, enabled = true, count }: Options) {
  useEffect(() => {
    if (!enabled || count < 1) return;
    const section = sectionRef.current;
    const root = scrollRootRef?.current ?? null;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      section.style.setProperty("--fill", "1");
      section.querySelectorAll(".story-tl__item").forEach((el) => {
        el.classList.add("is-in", "is-on");
      });
      return;
    }

    let ticking = false;

    const sync = () => {
      const items = [...section.querySelectorAll<HTMLElement>(".story-tl__item")];
      if (!items.length) return;

      const viewH = root?.clientHeight ?? window.innerHeight;
      const rootTop = root ? root.getBoundingClientRect().top : 0;
      const triggerY = rootTop + viewH * 0.6;

      const track = section.querySelector<HTMLElement>(".story-tl__track");
      const firstNode = items[0]?.querySelector<HTMLElement>(".story-tl__node");
      const lastNode = items[items.length - 1]?.querySelector<HTMLElement>(".story-tl__node");

      let fill = 0;
      if (track && firstNode && lastNode) {
        const trackRect = track.getBoundingClientRect();
        const firstY = firstNode.getBoundingClientRect().top + firstNode.offsetHeight / 2;
        const lastY = lastNode.getBoundingClientRect().top + lastNode.offsetHeight / 2;
        const span = Math.max(1, lastY - firstY);
        fill = Math.min(1, Math.max(0, (triggerY - firstY) / span));
        // Keep fill relative to track for visual continuity when section enters/leaves
        void trackRect;
      }

      section.style.setProperty("--fill", String(fill));

      items.forEach((item) => {
        const node = item.querySelector<HTMLElement>(".story-tl__node");
        const nodeCenter = node
          ? node.getBoundingClientRect().top + node.offsetHeight / 2
          : item.getBoundingClientRect().top + 24;
        const active = nodeCenter <= triggerY;
        item.classList.toggle("is-on", active);
        item.classList.toggle("is-in", active);
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        sync();
        ticking = false;
      });
    };

    const scrollTarget: HTMLElement | Window = root ?? window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    sync();

    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionRef, scrollRootRef, enabled, count]);
}
