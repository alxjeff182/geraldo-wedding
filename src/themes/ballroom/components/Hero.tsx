import { useRef, type RefObject } from "react";
import { useHeroFrames } from "../hooks/useHeroFrames";
import { useCountdown } from "../../../hooks/useCountdown";

type Props = {
  scrollRootRef: RefObject<HTMLElement | null>;
  eyebrow: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  dateLabel: string;
  labels: { days: string; hours: string; minutes: string; seconds: string };
  framesBase: string;
  frameCount: number;
  posterSrc?: string;
  enabled?: boolean;
  onProgress?: (progress: number) => void;
};

export function Hero({
  scrollRootRef,
  eyebrow,
  groomName,
  brideName,
  weddingDate,
  dateLabel,
  labels,
  framesBase,
  frameCount,
  posterSrc,
  enabled = true,
  onProgress,
}: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cd = useCountdown(weddingDate);

  useHeroFrames({
    basePath: framesBase,
    frameCount,
    posterSrc,
    canvasRef,
    scrollRootRef,
    heroRef,
    enabled,
    onProgress,
  });

  return (
    <section id="hero" ref={heroRef} className="hero" aria-label={eyebrow}>
      <div className="hero__pin">
        <canvas
          ref={canvasRef}
          className="hero__video"
          width={720}
          height={1280}
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
            Menuju {dateLabel.includes(",") ? dateLabel.split(",").slice(1).join(",").trim() : dateLabel}
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
      </div>
    </section>
  );
}
