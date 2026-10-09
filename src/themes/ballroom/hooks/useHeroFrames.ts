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
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastIndexRef = useRef(-1);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled || frameCount < 1) return;

    let cancelled = false;
    let cleanupScroll: (() => void) | null = null;
    let rafWait = 0;
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
      framesRef.current = frames;
      lastIndexRef.current = -1;
      let ticking = false;

      const drawFallback = () => {
        if (drawnFallback || !posterSrc) return;
        const poster = new Image();
        poster.src = posterSrc;
        poster.onload = () => {
          if (cancelled || lastIndexRef.current !== -1) return;
          ctx.drawImage(poster, 0, 0, canvas.width, canvas.height);
          drawnFallback = true;
        };
      };

      const drawFrame = (index: number) => {
        const img = frames[index];
        if (!img || !img.complete || !img.naturalWidth) {
          drawFallback();
          return;
        }
        if (index === lastIndexRef.current) return;
        lastIndexRef.current = index;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };

      const loadFrame = (i: number) => {
        if (frames[i]) return;
        const img = new Image();
        img.decoding = "async";
        const n = String(i + 1).padStart(3, "0");
        img.src = `${basePath.replace(/\/$/, "")}/${n}.jpg`;
        img.onload = () => {
          if (cancelled) return;
          if (lastIndexRef.current === -1 && i === 0) drawFrame(0);
          else if (i === lastIndexRef.current) {
            lastIndexRef.current = -1;
            drawFrame(i);
          }
        };
        frames[i] = img;
      };

      loadFrame(0);
      const loadRest = () => {
        for (let i = 1; i < frameCount; i += 1) loadFrame(i);
      };
      const idle = (
        window as Window & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (typeof idle === "function") {
        idle(loadRest, { timeout: 1200 });
      } else {
        window.setTimeout(loadRest, 400);
      }

      const heroInner = heroEl.querySelector(".hero__inner") as HTMLElement | null;
      const revealEls = heroEl.querySelectorAll("[data-reveal]");

      const sync = () => {
        const viewH = scrollRoot.clientHeight || 1;
        const maxScroll = Math.max(1, heroEl.offsetHeight - viewH);
        const progress = Math.min(1, Math.max(0, scrollRoot.scrollTop / maxScroll));
        const index = Math.min(
          frameCount - 1,
          Math.max(0, Math.round(progress * (frameCount - 1))),
        );
        drawFrame(index);

        revealEls.forEach((node) => {
          const el = node as HTMLElement;
          const at = Number(el.getAttribute("data-reveal")) || 0;
          el.classList.toggle("is-shown", progress >= at);
        });

        if (heroInner) {
          const textProgress = Math.max(0, (progress - 0.2) / 0.8);
          heroInner.style.transform = `translate3d(0, ${textProgress * -20}px, 0)`;
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
      cleanupScroll?.();
    };
  }, [basePath, frameCount, posterSrc, canvasRef, scrollRootRef, heroRef, enabled]);
}
