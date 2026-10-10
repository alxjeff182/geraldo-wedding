import { useEffect, useRef } from "react";

type Props = {
  active: boolean;
  src: string;
  poster: string;
  skipLabel?: string;
  onReveal: () => void;
};

const REVEAL_BEFORE_END = 0.85;

export function OpeningVideo({ active, src, poster, skipLabel = "Lewati", onReveal }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    revealedRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    video.preload = "auto";
    const play = video.play();
    play?.catch?.(() => {
      video.muted = true;
      video.play().catch(() => onReveal());
    });

    const safety = window.setTimeout(() => {
      if (!revealedRef.current) onReveal();
    }, 12000);

    return () => window.clearTimeout(safety);
  }, [active, onReveal]);

  const reveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    try {
      videoRef.current?.pause();
    } catch {
      /* noop */
    }
    onReveal();
  };

  return (
    <div className={`opening${active ? " is-active" : ""}`} aria-hidden={!active}>
      <video
        ref={videoRef}
        className="opening__video"
        playsInline
        muted
        preload="metadata"
        poster={poster}
        onTimeUpdate={() => {
          const video = videoRef.current;
          if (!video?.duration || revealedRef.current) return;
          if (video.duration - video.currentTime <= REVEAL_BEFORE_END) {
            reveal();
          }
        }}
        onEnded={() => reveal()}
        onError={() => reveal()}
      >
        <source src={src} type="video/mp4" />
      </video>
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
