import { useEffect, useRef, type RefObject } from "react";

type Options = {
  basePath: string;
  frameCount: number;
  posterSrc?: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  scrollRootRef: RefObject<HTMLElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  /** Total duration to play every frame once on open. */
  introDurationMs?: number;
  onProgress?: (progress: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function useHeroFrames({
  basePath,
  frameCount,
  posterSrc,
  canvasRef,
  scrollRootRef,
  heroRef,
  enabled = true,
  introDurationMs = 5200,
  onProgress,
}: Options) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled || frameCount < 1) return;

    let cancelled = false;
    let cleanupScroll: (() => void) | null = null;
    let rafWait = 0;
    let rafIntro = 0;
    let drawnFallback = false;
    let readyTimer = 0;

    const start = () => {
      const canvas = canvasRef.current;
      const scrollRoot = scrollRootRef.current;
      const heroEl = heroRef.current;
      if (!canvas || !scrollRoot || !heroEl) {
        rafWait = requestAnimationFrame(start);
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
      let loadedCount = 0;
      let ticking = false;
      let introActive = false;
      let userTookOver = false;
      let lastExact = -1;

      const drawFallback = () => {
        if (drawnFallback || !posterSrc) return;
        const poster = new Image();
        poster.src = posterSrc;
        poster.onload = () => {
          if (cancelled || lastExact >= 0) return;
          ctx.globalAlpha = 1;
          ctx.drawImage(poster, 0, 0, canvas.width, canvas.height);
          drawnFallback = true;
        };
      };

      const readyImage = (index: number) => {
        const img = frames[clamp(index, 0, frameCount - 1)];
        return img?.complete && img.naturalWidth ? img : null;
      };

      const nearestReady = (index: number) => {
        const direct = readyImage(index);
        if (direct) return direct;
        for (let d = 1; d < frameCount; d += 1) {
          const left = readyImage(index - d);
          if (left) return left;
          const right = readyImage(index + d);
          if (right) return right;
        }
        return null;
      };

      /** Crossfade between adjacent frames for butter-smooth scrubbing. */
      const paintExact = (exact: number) => {
        const maxIdx = frameCount - 1;
        const e = clamp(exact, 0, maxIdx);
        if (Math.abs(e - lastExact) < 0.001) return;
        lastExact = e;

        const i0 = Math.floor(e);
        const i1 = Math.min(maxIdx, i0 + 1);
        const blend = e - i0;
        const a = nearestReady(i0);
        const b = i1 === i0 ? a : nearestReady(i1);

        if (!a) {
          drawFallback();
          return;
        }

        ctx.globalAlpha = 1;
        ctx.drawImage(a, 0, 0, canvas.width, canvas.height);
        if (b && b !== a && blend > 0.02) {
          ctx.globalAlpha = blend;
          ctx.drawImage(b, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
        }
      };

      const heroInner = heroEl.querySelector(".hero__inner") as HTMLElement | null;
      const revealEls = heroEl.querySelectorAll("[data-reveal]");

      const applyProgressUi = (progress: number) => {
        revealEls.forEach((node) => {
          const el = node as HTMLElement;
          const at = Number(el.getAttribute("data-reveal")) || 0;
          el.classList.toggle("is-shown", progress >= at);
        });

        if (heroInner) {
          const textProgress = Math.max(0, (progress - 0.12) / 0.88);
          heroInner.style.transform = `translate3d(0, ${textProgress * -8}px, 0)`;
        }

        heroEl.classList.toggle("is-reading", progress >= 0.22);
        onProgressRef.current?.(progress);
      };

      const maxScrollForHero = () => {
        const viewH = scrollRoot.clientHeight || 1;
        return Math.max(1, heroEl.offsetHeight - viewH);
      };

      const applyProgress = (
        progress: number,
        { syncScroll = false }: { syncScroll?: boolean } = {},
      ) => {
        const p = clamp(progress, 0, 1);
        paintExact(p * (frameCount - 1));
        if (syncScroll) {
          scrollRoot.scrollTop = maxScrollForHero() * p;
        }
        applyProgressUi(p);
      };

      const loadFrame = (i: number) => {
        if (frames[i]) return;
        const img = new Image();
        img.decoding = "async";
        img.fetchPriority = i < 8 ? "high" : "low";
        const n = String(i + 1).padStart(3, "0");
        img.src = `${basePath.replace(/\/$/, "")}/${n}.jpg`;
        img.onload = () => {
          if (cancelled) return;
          loadedCount += 1;
          void img.decode?.().catch(() => undefined);
          if (lastExact < 0 && i === 0) paintExact(0);
        };
        frames[i] = img;
      };

      for (let i = 0; i < frameCount; i += 1) loadFrame(i);

      const stopIntro = () => {
        if (!introActive) return;
        introActive = false;
        cancelAnimationFrame(rafIntro);
      };

      const takeOver = () => {
        if (userTookOver) return;
        userTookOver = true;
        stopIntro();
        // Keep scrub position aligned with the frame currently on screen.
        if (lastExact >= 0) {
          const p = lastExact / Math.max(1, frameCount - 1);
          scrollRoot.scrollTop = maxScrollForHero() * p;
        }
      };

      const onScroll = () => {
        if (introActive) return;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const progress = clamp(scrollRoot.scrollTop / maxScrollForHero(), 0, 1);
          applyProgress(progress);
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
          applyProgress(clamp(scrollRoot.scrollTop / maxScrollForHero(), 0, 1));
          return;
        }

        if (reduceMotion) {
          applyProgress(1, { syncScroll: true });
          return;
        }

        introActive = true;
        const startedAt = performance.now();
        const holdRatio = 0.04;
        const playSpan = 1 - holdRatio * 2;

        const tick = (now: number) => {
          if (cancelled || userTookOver || !introActive) {
            introActive = false;
            applyProgress(clamp(scrollRoot.scrollTop / maxScrollForHero(), 0, 1));
            return;
          }

          const raw = clamp((now - startedAt) / introDurationMs, 0, 1);
          let linear: number;
          if (raw <= holdRatio) linear = 0;
          else if (raw >= 1 - holdRatio) linear = 1;
          else linear = (raw - holdRatio) / playSpan;

          const progress = easeInOutCubic(linear);
          // Animate frames only during intro — avoid scrollTop thrash every frame.
          applyProgress(progress, { syncScroll: false });

          if (raw < 1) {
            rafIntro = requestAnimationFrame(tick);
          } else {
            introActive = false;
            applyProgress(1, { syncScroll: true });
          }
        };

        rafIntro = requestAnimationFrame(tick);
      };

      const beginWhenReady = () => {
        if (cancelled) return;
        const allReady = loadedCount >= frameCount;
        const mostlyReady = loadedCount >= Math.max(12, Math.ceil(frameCount * 0.75));
        if (allReady || mostlyReady) {
          readyTimer = window.setTimeout(() => {
            if (!cancelled) runIntro();
          }, allReady ? 40 : 120);
          return;
        }

        const started = performance.now();
        const wait = () => {
          if (cancelled) return;
          if (loadedCount >= frameCount || performance.now() - started > 2500) {
            runIntro();
            return;
          }
          if (loadedCount >= Math.ceil(frameCount * 0.8) && performance.now() - started > 600) {
            runIntro();
            return;
          }
          rafWait = requestAnimationFrame(wait);
        };
        rafWait = requestAnimationFrame(wait);
      };

      beginWhenReady();
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafWait);
      cancelAnimationFrame(rafIntro);
      window.clearTimeout(readyTimer);
      cleanupScroll?.();
    };
  }, [basePath, frameCount, posterSrc, canvasRef, scrollRootRef, heroRef, enabled, introDurationMs]);
}
