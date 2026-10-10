import { useEffect, useRef, type RefObject } from "react";

type Options = {
  basePath: string;
  frameCount: number;
  posterSrc?: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  scrollRootRef: RefObject<HTMLElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  /** Progress (0–1) where the auto intro lands before handing off to user scroll. */
  introProgress?: number;
  /** Auto-intro duration in ms. */
  introDurationMs?: number;
  onProgress?: (progress: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function useHeroFrames({
  basePath,
  frameCount,
  posterSrc,
  canvasRef,
  scrollRootRef,
  heroRef,
  enabled = true,
  introProgress = 0.32,
  introDurationMs = 3200,
  onProgress,
}: Options) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled || frameCount < 1) return;

    let cancelled = false;
    let cleanupScroll: (() => void) | null = null;
    let cleanupIntro: (() => void) | null = null;
    let rafWait = 0;
    let rafStep = 0;
    let rafIntro = 0;
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
      let introActive = false;
      let userTookOver = false;

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

      for (let i = 0; i < frameCount; i += 1) loadFrame(i);

      const heroInner = heroEl.querySelector(".hero__inner") as HTMLElement | null;
      const revealEls = heroEl.querySelectorAll("[data-reveal]");

      const syncFromScroll = () => {
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

      const stopIntro = () => {
        if (!introActive) return;
        introActive = false;
        cancelAnimationFrame(rafIntro);
      };

      const takeOver = () => {
        if (userTookOver) return;
        userTookOver = true;
        stopIntro();
      };

      const onScroll = () => {
        if (introActive) return;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          syncFromScroll();
          ticking = false;
        });
      };

      const onUserGesture = () => takeOver();

      scrollRoot.addEventListener("scroll", onScroll, { passive: true });
      scrollRoot.addEventListener("wheel", onUserGesture, { passive: true });
      scrollRoot.addEventListener("touchstart", onUserGesture, { passive: true });
      scrollRoot.addEventListener("pointerdown", onUserGesture, { passive: true });

      cleanupScroll = () => {
        scrollRoot.removeEventListener("scroll", onScroll);
        scrollRoot.removeEventListener("wheel", onUserGesture);
        scrollRoot.removeEventListener("touchstart", onUserGesture);
        scrollRoot.removeEventListener("pointerdown", onUserGesture);
      };

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const runIntro = () => {
        if (cancelled || userTookOver) {
          syncFromScroll();
          return;
        }

        const viewH = scrollRoot.clientHeight || 1;
        const maxScroll = Math.max(1, heroEl.offsetHeight - viewH);
        const targetTop = maxScroll * clamp(introProgress, 0.05, 0.9);

        if (reduceMotion || targetTop <= 0) {
          scrollRoot.scrollTop = targetTop;
          syncFromScroll();
          return;
        }

        introActive = true;
        const from = scrollRoot.scrollTop;
        const startedAt = performance.now();

        const tick = (now: number) => {
          if (cancelled || userTookOver || !introActive) {
            introActive = false;
            syncFromScroll();
            return;
          }
          const t = clamp((now - startedAt) / introDurationMs, 0, 1);
          const eased = easeOutCubic(t);
          scrollRoot.scrollTop = from + (targetTop - from) * eased;
          syncFromScroll();
          if (t < 1) {
            rafIntro = requestAnimationFrame(tick);
          } else {
            introActive = false;
            syncFromScroll();
          }
        };

        rafIntro = requestAnimationFrame(tick);
      };

      // Start intro once the first frame is ready (or after a short fallback wait).
      const beginWhenReady = () => {
        if (cancelled) return;
        const first = frames[0];
        if (first?.complete && first.naturalWidth) {
          runIntro();
          return;
        }
        const started = performance.now();
        const wait = () => {
          if (cancelled) return;
          const img = frames[0];
          if ((img?.complete && img.naturalWidth) || performance.now() - started > 900) {
            runIntro();
            return;
          }
          rafWait = requestAnimationFrame(wait);
        };
        rafWait = requestAnimationFrame(wait);
      };

      beginWhenReady();

      cleanupIntro = () => {
        stopIntro();
      };
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafWait);
      cancelAnimationFrame(rafStep);
      cancelAnimationFrame(rafIntro);
      cleanupScroll?.();
      cleanupIntro?.();
    };
  }, [
    basePath,
    frameCount,
    posterSrc,
    canvasRef,
    scrollRootRef,
    heroRef,
    enabled,
    introProgress,
    introDurationMs,
  ]);
}
