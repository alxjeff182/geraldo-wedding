import { useEffect, useRef } from "react";

type Props = {
  src: string;
  poster: string;
  skipLabel?: string;
  onReveal: () => void;
};

const REVEAL_BEFORE_END = 0.85;
/** Ignore near-end checks until playback has actually advanced. */
const MIN_PLAYHEAD = 0.25;
const SAFETY_MS = 14000;

function waitForEvent(video: HTMLVideoElement, event: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener(event, finish);
      resolve();
    };
    video.addEventListener(event, finish);
    window.setTimeout(finish, timeoutMs);
  });
}

export function OpeningVideo({ src, poster, skipLabel = "Lewati", onReveal }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealedRef = useRef(false);
  const playingRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    cancelledRef.current = false;
    revealedRef.current = false;
    playingRef.current = false;

    const revealOnce = () => {
      if (cancelledRef.current || revealedRef.current) return;
      revealedRef.current = true;
      try {
        video.pause();
      } catch {
        /* noop */
      }
      onReveal();
    };

    const start = async () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "auto";
      video.poster = poster;

      try {
        video.pause();
      } catch {
        /* noop */
      }

      // Fresh media pipeline every mount (close → open). .src + load() is more
      // reliable across Chrome / Safari / iOS than reusing a finished <source>.
      video.src = src;
      video.load();

      await waitForEvent(video, "loadeddata", 4000);
      if (cancelledRef.current || revealedRef.current) return;

      try {
        video.currentTime = 0;
      } catch {
        /* noop */
      }
      if (video.currentTime > 0.05) {
        await waitForEvent(video, "seeked", 800);
      }
      if (cancelledRef.current || revealedRef.current) return;

      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await waitForEvent(video, "canplay", 4000);
      }
      if (cancelledRef.current || revealedRef.current) return;

      const tryPlay = async () => {
        video.muted = true;
        await video.play();
        playingRef.current = true;
      };

      try {
        await tryPlay();
      } catch {
        if (cancelledRef.current || revealedRef.current) return;
        await new Promise((r) => window.setTimeout(r, 120));
        if (cancelledRef.current || revealedRef.current) return;
        try {
          await tryPlay();
        } catch {
          // Keep overlay + skip; safety timer still covers total failure.
        }
      }
    };

    void start();

    const safety = window.setTimeout(() => {
      if (!cancelledRef.current && !revealedRef.current) revealOnce();
    }, SAFETY_MS);

    return () => {
      cancelledRef.current = true;
      window.clearTimeout(safety);
      try {
        video.pause();
      } catch {
        /* noop */
      }
    };
  }, [src, poster, onReveal]);

  const reveal = () => {
    if (cancelledRef.current || revealedRef.current) return;
    revealedRef.current = true;
    try {
      videoRef.current?.pause();
    } catch {
      /* noop */
    }
    onReveal();
  };

  const maybeRevealNearEnd = () => {
    const video = videoRef.current;
    if (!video || cancelledRef.current || revealedRef.current || !playingRef.current) return;
    const { duration, currentTime } = video;
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (currentTime < MIN_PLAYHEAD) return;
    if (duration - currentTime <= REVEAL_BEFORE_END) reveal();
  };

  return (
    <div className="opening is-active" aria-hidden={false}>
      <video
        ref={videoRef}
        className="opening__video"
        playsInline
        muted
        preload="auto"
        poster={poster}
        onPlaying={() => {
          playingRef.current = true;
        }}
        onTimeUpdate={maybeRevealNearEnd}
        onEnded={() => reveal()}
        onError={() => {
          if (cancelledRef.current || playingRef.current) return;
          reveal();
        }}
      />
      <div className="opening__vignette" aria-hidden="true" />
      <div className="opening__skip-wrap">
        <button
          type="button"
          className="opening__skip opening__skip--visible"
          onClick={() => reveal()}
        >
          {skipLabel}
        </button>
      </div>
    </div>
  );
}
