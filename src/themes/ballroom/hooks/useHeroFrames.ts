import { useEffect, useRef, type RefObject } from "react";

type Options = {
  basePath: string;
  frameCount: number;
  posterSrc?: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  scrollRootRef: RefObject<HTMLElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  onProgress?: (progress: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useHeroFrames({
  basePath,
  frameCount,
  posterSrc,
  canvasRef,
  scrollRootRef,
  heroRef,
  enabled = true,
  onProgress,
}: Options) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled || frameCount < 1) return;

    let cancelled = false;
    let cleanupScroll: (() => void) | null = null;
    let rafWait = 0;
    let rafStep = 0;
    let drawnFallback = false;

    const start = () => {
      const canvas = canvasRef.current;
      const scrollRoot = scrollRootRef.current;
      const heroEl = heroRef.current;
      if (!canvas || !scrollRoot || !heroEl) {
        rafWait = requestAnimationFrame(start);
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
      let lastDrawn = -1;
      let displayIndex = 0;
      let targetIndex = 0;
      let stepping = false;
      let ticking = false;

      const drawFallback = () => {
        if (drawnFallback || !posterSrc) return;
        const poster = new Image();
        poster.src = posterSrc;
        poster.onload = () => {
          if (cancelled || lastDrawn !== -1) return;
          ctx.drawImage(poster, 0, 0, canvas.width, canvas.height);
          drawnFallback = true;
        };
      };

      const paint = (index: number) => {
        const img = frames[index];
        if (!img || !img.complete || !img.naturalWidth) {
          drawFallback();
          return false;
        }
        if (index === lastDrawn) return true;
        lastDrawn = index;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return true;
      };

      const stepTowardTarget = () => {
        stepping = false;
        if (cancelled) return;
        if (displayIndex === targetIndex) {
          paint(displayIndex);
          return;
        }
        displayIndex += displayIndex < targetIndex ? 1 : -1;
        paint(displayIndex);
        if (displayIndex !== targetIndex) {
          stepping = true;
          rafStep = requestAnimationFrame(stepTowardTarget);
        }
      };

      const setTargetIndex = (next: number) => {
        targetIndex = clamp(next, 0, frameCount - 1);
        if (displayIndex === targetIndex) {
          paint(displayIndex);
          return;
        }
        if (!stepping) {
          stepping = true;
          rafStep = requestAnimationFrame(stepTowardTarget);
        }
      };

      const loadFrame = (i: number) => {
        if (frames[i]) return;
        const img = new Image();
        img.decoding = "async";
        if (i < 4) img.fetchPriority = "high";
        const n = String(i + 1).padStart(3, "0");
        img.src = `${basePath.replace(/\/$/, "")}/${n}.jpg`;
        img.onload = () => {
          if (cancelled) return;
          void img.decode?.().catch(() => undefined);
          if (lastDrawn === -1 && i === 0) {
            displayIndex = 0;
            targetIndex = 0;
            paint(0);
          } else if (i === targetIndex || i === displayIndex) {
            lastDrawn = -1;
            paint(displayIndex);
          }
        };
        frames[i] = img;
      };

      // Load every frame up front so scroll scrubbing never skips missing images.
      for (let i = 0; i < frameCount; i += 1) loadFrame(i);

      const heroInner = heroEl.querySelector(".hero__inner") as HTMLElement | null;
      const revealEls = heroEl.querySelectorAll("[data-reveal]");

      const sync = () => {
        const viewH = scrollRoot.clientHeight || 1;
        const maxScroll = Math.max(1, heroEl.offsetHeight - viewH);
        const progress = clamp(scrollRoot.scrollTop / maxScroll, 0, 1);
        const index = Math.round(progress * (frameCount - 1));
        setTargetIndex(index);

        revealEls.forEach((node) => {
          const el = node as HTMLElement;
          const at = Number(el.getAttribute("data-reveal")) || 0;
          el.classList.toggle("is-shown", progress >= at);
        });

        if (heroInner) {
          const textProgress = Math.max(0, (progress - 0.12) / 0.88);
          heroInner.style.transform = `translate3d(0, ${textProgress * -28}px, 0)`;
        }

        heroEl.classList.toggle("is-reading", progress >= 0.22);
        onProgressRef.current?.(progress);
      };

      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          sync();
          ticking = false;
        });
      };

      scrollRoot.addEventListener("scroll", onScroll, { passive: true });
      sync();
      cleanupScroll = () => scrollRoot.removeEventListener("scroll", onScroll);
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafWait);
      cancelAnimationFrame(rafStep);
      cleanupScroll?.();
    };
  }, [basePath, frameCount, posterSrc, canvasRef, scrollRootRef, heroRef, enabled]);
}
