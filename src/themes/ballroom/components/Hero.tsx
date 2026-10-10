import { useCallback, useRef, useState } from "react";
import { useHeroVideo } from "../hooks/useHeroVideo";
import { useCountdown } from "../../../hooks/useCountdown";

type Props = {
  eyebrow: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  dateLabel: string;
  labels: { days: string; hours: string; minutes: string; seconds: string };
  videoSrc: string;
  posterSrc?: string;
  enabled?: boolean;
  onProgress?: (progress: number) => void;
};

const HINT_HIDE_AT = 0.04;

export function Hero({
  eyebrow,
  groomName,
  brideName,
  weddingDate,
  dateLabel,
  labels,
  videoSrc,
  posterSrc,
  enabled = true,
  onProgress,
}: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hintGone, setHintGone] = useState(false);
  const cd = useCountdown(weddingDate);

  const handleProgress = useCallback(
    (progress: number) => {
      setHintGone(progress >= HINT_HIDE_AT);
      onProgress?.(progress);
    },
    [onProgress],
  );

  useHeroVideo({
    videoRef,
    heroRef,
    enabled,
    onProgress: handleProgress,
  });

  return (
    <section id="hero" ref={heroRef} className="hero" aria-label={eyebrow}>
      <div className="hero__pin">
        <video
          ref={videoRef}
          className="hero__video"
          src={videoSrc}
          poster={posterSrc}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__inner">
          <p className="hero__eyebrow" data-reveal="0.08">
            {eyebrow}
          </p>
          <h2 className="hero__names" data-reveal="0.14">
            {groomName} <span>&</span> {brideName}
          </h2>
          <p className="visually-hidden">
            Menuju{" "}
            {dateLabel.includes(",") ? dateLabel.split(",").slice(1).join(",").trim() : dateLabel}
          </p>
          <div className="hero__countdown" data-reveal="0.22" aria-hidden="true">
            <div className="hero__cd-item">
              <span>{String(cd.days).padStart(2, "0")}</span>
              <small>{labels.days}</small>
            </div>
            <span className="hero__cd-sep" aria-hidden="true">
              :
            </span>
            <div className="hero__cd-item">
              <span>{String(cd.hours).padStart(2, "0")}</span>
              <small>{labels.hours}</small>
            </div>
            <span className="hero__cd-sep" aria-hidden="true">
              :
            </span>
            <div className="hero__cd-item">
              <span>{String(cd.minutes).padStart(2, "0")}</span>
              <small>{labels.minutes}</small>
            </div>
            <span className="hero__cd-sep" aria-hidden="true">
              :
            </span>
            <div className="hero__cd-item">
              <span>{String(cd.seconds).padStart(2, "0")}</span>
              <small>{labels.seconds}</small>
            </div>
          </div>
        </div>
        <div className={`hero__hint${hintGone ? " is-gone" : ""}`} aria-hidden="true">
          <div className="hero__hint-motion">
            <span className="hero__hint-chevron" />
            <span className="hero__hint-chevron" />
          </div>
        </div>
      </div>
    </section>
  );
}
