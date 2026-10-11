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
    const timers = new Set<number>();
    let detach: (() => void) | null = null;

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const bind = () => {
      const video = videoRef.current;
      const heroEl = heroRef.current;
      if (!video || !heroEl) {
        waitRaf = requestAnimationFrame(bind);
        return;
      }

      const heroInner = heroEl.querySelector(".hero__inner") as HTMLElement | null;
      const revealEls = heroEl.querySelectorAll("[data-reveal]");
      const scrollRoot = heroEl.closest(".invitation") as HTMLElement | null;

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

      // iOS needs muted + playsInline before any play() attempt.
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("autoplay", "");
      video.preload = "auto";

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

        detach = () => {
          video.removeEventListener("timeupdate", onTimeUpdate);
          video.removeEventListener("ended", onEnded);
          video.removeEventListener("loadedmetadata", onLoaded);
          video.removeEventListener("play", tick);
        };
        return;
      }

      let attempts = 0;
      const maxAttempts = 8;

      const tryPlay = () => {
        if (cancelled || (!video.paused && !video.ended)) return;
        attempts += 1;
        video.muted = true;
        const playPromise = video.play();
        if (playPromise?.catch) {
          void playPromise.catch(() => {
            applyProgress(readProgress());
            if (!cancelled && attempts < maxAttempts) {
              later(tryPlay, 280 * attempts);
            }
          });
        }
      };

      // Parent was `hidden` until reveal — force a fresh load on iOS.
      try {
        video.load();
      } catch {
        /* noop */
      }

      const onCanPlay = () => tryPlay();
      const onLoadedData = () => tryPlay();
      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("loadeddata", onLoadedData);

      // First touch/scroll inside the invite unlocks autoplay if muted-play was blocked.
      const unlock = () => tryPlay();
      scrollRoot?.addEventListener("touchstart", unlock, { passive: true });
      scrollRoot?.addEventListener("pointerdown", unlock, { passive: true });
      scrollRoot?.addEventListener("scroll", unlock, { passive: true, once: true });

      // Kick off after layout — invite reveal animation finishes ~1.4s; start sooner too.
      tryPlay();
      later(tryPlay, 120);
      later(tryPlay, 500);
      later(tryPlay, 1600);

      raf = requestAnimationFrame(tick);

      detach = () => {
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("play", tick);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("loadeddata", onLoadedData);
        scrollRoot?.removeEventListener("touchstart", unlock);
        scrollRoot?.removeEventListener("pointerdown", unlock);
        scrollRoot?.removeEventListener("scroll", unlock);
        video.pause();
      };
    };

    bind();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(waitRaf);
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      detach?.();
    };
  }, [videoRef, heroRef, enabled]);
}
