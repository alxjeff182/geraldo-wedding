import { useEffect, useRef, type RefObject } from "react";

type Options = {
  videoRef: RefObject<HTMLVideoElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  onProgress?: (progress: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useHeroVideo({ videoRef, heroRef, enabled = true, onProgress }: Options) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let raf = 0;
    let waitRaf = 0;
    let detach: (() => void) | null = null;

    const bind = () => {
      const video = videoRef.current;
      const heroEl = heroRef.current;
      if (!video || !heroEl) {
        waitRaf = requestAnimationFrame(bind);
        return;
      }

      const heroInner = heroEl.querySelector(".hero__inner") as HTMLElement | null;
      const revealEls = heroEl.querySelectorAll("[data-reveal]");

      const applyProgress = (progress: number) => {
        const p = clamp(progress, 0, 1);

        revealEls.forEach((node) => {
          const el = node as HTMLElement;
          const at = Number(el.getAttribute("data-reveal")) || 0;
          el.classList.toggle("is-shown", p >= at);
        });

        if (heroInner) {
          const textProgress = Math.max(0, (p - 0.12) / 0.88);
          heroInner.style.transform = `translate3d(0, ${textProgress * -8}px, 0)`;
        }

        heroEl.classList.toggle("is-reading", p >= 0.22);
        onProgressRef.current?.(p);
      };

      const readProgress = () => {
        if (video.ended) return 1;
        const duration = video.duration;
        if (!Number.isFinite(duration) || duration <= 0) return 0;
        return clamp(video.currentTime / duration, 0, 1);
      };

      const tick = () => {
        if (cancelled) return;
        applyProgress(readProgress());
        if (!video.paused && !video.ended) {
          raf = requestAnimationFrame(tick);
        }
      };

      const onTimeUpdate = () => applyProgress(readProgress());
      const onEnded = () => applyProgress(1);
      const onLoaded = () => {
        if (cancelled) return;
        applyProgress(readProgress());
      };

      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("ended", onEnded);
      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("play", tick);

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        const jump = () => {
          if (!Number.isFinite(video.duration) || video.duration <= 0) return;
          video.pause();
          video.currentTime = video.duration;
          applyProgress(1);
        };
        if (video.readyState >= 1) jump();
        else video.addEventListener("loadedmetadata", jump, { once: true });
      } else {
        const tryPlay = () => {
          void video.play().catch(() => {
            applyProgress(0);
          });
        };
        if (video.readyState >= 2) tryPlay();
        else video.addEventListener("canplay", tryPlay, { once: true });
        raf = requestAnimationFrame(tick);
      }

      detach = () => {
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("play", tick);
        video.pause();
      };
    };

    bind();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(waitRaf);
      detach?.();
    };
  }, [videoRef, heroRef, enabled]);
}
