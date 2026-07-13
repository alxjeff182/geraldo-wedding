import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  HERO_REVEAL_DURATION,
  HERO_REVEAL_FALLBACK_MS,
  HERO_REVEAL_VIDEO_SEC,
  OPEN_EASE,
} from "../../constants/open-animation";
import { useWeddingContent } from "../../context/WeddingContentContext";
import { HeroShortcuts } from "./HeroShortcuts";
import type { HeroShortcutId } from "../../types/hero-shortcut";

const REVEAL_EASE = OPEN_EASE;

type Props = {
  /** Cover parallax selesai — baru mulai video & reveal pill */
  coverOpenComplete: boolean;
  onShortcutOpen: (id: HeroShortcutId) => void;
};

function Particles({ visible }: { visible: boolean }) {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${(i * 17) % 100}%`,
    delay: `${(i % 10) * 0.7}s`,
    duration: `${8 + (i % 5)}s`,
  }));

  if (!visible) return null;

  return (
    <div className="particles" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
    </div>
  );
}

function HeroSparkle() {
  return (
    <span className="hero-sparkle" aria-hidden>
      <span className="hero-sparkle__core" />
      <span className="hero-sparkle__ring" />
    </span>
  );
}

export function Hero({ coverOpenComplete, onShortcutOpen }: Props) {
  const { content } = useWeddingContent();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [contentRevealed, setContentRevealed] = useState(false);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  useEffect(() => {
    const video = videoRef.current;
    if (!coverOpenComplete) {
      setContentRevealed(false);
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      return;
    }

    if (reducedMotion) {
      const timer = window.setTimeout(() => setContentRevealed(true), HERO_REVEAL_DURATION * 1000);
      return () => window.clearTimeout(timer);
    }

    if (!video) return;

    video.src = content.media.video;
    video.preload = "auto";
    video.load();

    void video.play().catch(() => undefined);

    const reveal = () => setContentRevealed(true);

    const onTimeUpdate = () => {
      if (video.currentTime >= HERO_REVEAL_VIDEO_SEC) {
        reveal();
        video.removeEventListener("timeupdate", onTimeUpdate);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);

    const fallback = window.setTimeout(() => {
      reveal();
      video.removeEventListener("timeupdate", onTimeUpdate);
    }, HERO_REVEAL_FALLBACK_MS);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      window.clearTimeout(fallback);
    };
  }, [coverOpenComplete, content.media.video, reducedMotion]);

  return (
    <section ref={sectionRef} className="section-hero-wrap" aria-label="Sampul mempelai">
      {!reducedMotion ? (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={false}
          animate={coverOpenComplete ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.85, ease: REVEAL_EASE }}
          aria-hidden
        >
          <motion.video
            ref={videoRef}
            className="h-full w-full object-cover"
            style={{ scale: bgScale }}
            initial={false}
            animate={coverOpenComplete ? { y: 0, scale: 1 } : { y: "4%", scale: 1.1 }}
            transition={{ duration: 0.85, ease: REVEAL_EASE }}
            muted
            playsInline
            preload="none"
            aria-hidden
          />
        </motion.div>
      ) : null}
      <Particles visible={contentRevealed} />

      {contentRevealed && (
        <motion.div
          className="hero-card-reveal"
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: HERO_REVEAL_DURATION, ease: REVEAL_EASE }}
        >
          <div className="hero-pill">
            {!reducedMotion && (
              <div className="absolute top-3 right-3 z-20">
                <HeroSparkle />
              </div>
            )}

            <div className="hero-pill__photo-wrap">
              <motion.img
                src={content.media.heroPhoto}
                alt="Geraldo dan Christin"
                className="hero-pill__image"
                width={576}
                height={1024}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: HERO_REVEAL_DURATION,
                  ease: REVEAL_EASE,
                  delay: 0.12,
                }}
                loading="eager"
                fetchPriority="high"
              />
            </div>

            <div className="hero-pill__footer">
              <div className="hero-pill__caption">
                <p className="hero-pill__eyebrow">{content.hero.eyebrow}</p>
                <h1 className="hero-pill__names">
                  <span className="hero-pill__name">{content.hero.groomName}</span>
                  <span className="hero-pill__amp" aria-hidden>
                    &
                  </span>
                  <span className="hero-pill__name">{content.hero.brideName}</span>
                </h1>
              </div>
              <HeroShortcuts onOpen={onShortcutOpen} />
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
