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

export function useHeroFrames({
  basePath,
  frameCount,
  posterSrc,
  canvasRef,
  scrollRootRef,
  heroRef,
  enabled = true,
  introDurationMs = 3600,
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
      let loadedCount = 0;
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
        const safe = clamp(index, 0, frameCount - 1);
        const img = frames[safe];
        if (!img || !img.complete || !img.naturalWidth) {
          // Prefer nearest loaded neighbor so motion never blanks.
          for (let d = 1; d < frameCount; d += 1) {
            const left = frames[safe - d];
            if (left?.complete && left.naturalWidth) {
              if (safe - d !== lastDrawn) {
                lastDrawn = safe - d;
                ctx.drawImage(left, 0, 0, canvas.width, canvas.height);
              }
              return true;
            }
            const right = frames[safe + d];
            if (right?.complete && right.naturalWidth) {
              if (safe + d !== lastDrawn) {
                lastDrawn = safe + d;
                ctx.drawImage(right, 0, 0, canvas.width, canvas.height);
              }
              return true;
            }
          }
          drawFallback();
          return false;
        }
        if (safe === lastDrawn) return true;
        lastDrawn = safe;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return true;
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
          // Keep motion subtle — large negative Y clips the eyebrow under overflow:hidden.
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

      const applyProgress = (progress: number, { syncScroll }: { syncScroll?: boolean } = {}) => {
        const p = clamp(progress, 0, 1);
        // Map continuously across every frame (no rounding gaps during intro).
        const exact = p * (frameCount - 1);
        const index = clamp(Math.round(exact), 0, frameCount - 1);
        paint(index);
        if (syncScroll) {
          scrollRoot.scrollTop = maxScrollForHero() * p;
        }
        applyProgressUi(p);
      };

      const loadFrame = (i: number) => {
        if (frames[i]) return;
        const img = new Image();
        img.decoding = "async";
        if (i < 6) img.fetchPriority = "high";
        const n = String(i + 1).padStart(3, "0");
        img.src = `${basePath.replace(/\/$/, "")}/${n}.jpg`;
        img.onload = () => {
          if (cancelled) return;
          loadedCount += 1;
          void img.decode?.().catch(() => undefined);
          if (lastDrawn === -1 && i === 0) paint(0);
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
        // Hold first + last frame briefly so the sequence reads complete.
        const holdRatio = 0.06;
        const playSpan = 1 - holdRatio * 2;

        const tick = (now: number) => {
          if (cancelled || userTookOver || !introActive) {
            introActive = false;
            applyProgress(clamp(scrollRoot.scrollTop / maxScrollForHero(), 0, 1));
            return;
          }

          const t = clamp((now - startedAt) / introDurationMs, 0, 1);
          let progress: number;
          if (t <= holdRatio) progress = 0;
          else if (t >= 1 - holdRatio) progress = 1;
          else progress = (t - holdRatio) / playSpan;

          // Linear time → linear frame index (every frame gets equal time).
          applyProgress(progress, { syncScroll: true });

          if (t < 1) {
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
        const firstReady = Boolean(frames[0]?.complete && frames[0]?.naturalWidth);
        const enoughReady = loadedCount >= Math.min(frameCount, 8);
        if (firstReady && (enoughReady || loadedCount >= 1)) {
          // Small delay lets more frames decode before the sweep starts.
          window.setTimeout(() => {
            if (!cancelled) runIntro();
          }, enoughReady ? 80 : 280);
          return;
        }
        const started = performance.now();
        const wait = () => {
          if (cancelled) return;
          if (
            (frames[0]?.complete && frames[0]?.naturalWidth && loadedCount >= 4) ||
            performance.now() - started > 1200
          ) {
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
      cleanupScroll?.();
    };
  }, [basePath, frameCount, posterSrc, canvasRef, scrollRootRef, heroRef, enabled, introDurationMs]);
}
