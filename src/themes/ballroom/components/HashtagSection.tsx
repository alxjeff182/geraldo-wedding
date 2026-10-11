import { useEffect, useRef, useState } from "react";
import { useWeddingContent } from "../../../context/use-wedding-content";
import { hashtagExploreUrl } from "../../../lib/hashtag-url";
import { IconInstagram } from "../icons";
import { StoryBooth } from "./StoryBooth";

type Props = {
  title: string;
  tag: string;
  storyTemplate?: string;
  onToast?: (msg: string) => void;
  onBoothOpen?: () => void;
  onBoothClose?: () => void;
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

export function HashtagSection({
  title,
  tag,
  storyTemplate,
  onToast,
  onBoothOpen,
  onBoothClose,
}: Props) {
  const { content } = useWeddingContent();
  const [boothOpen, setBoothOpen] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const phoneRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inViewRef = useRef(false);
  const boothOpenRef = useRef(false);

  const display = tag.startsWith("#") ? tag : `#${tag}`;
  const template = storyTemplate?.trim() || content.hashtag.storyTemplate?.trim() || "";
  const boothLabel = content.hashtag.boothButton || "Rekam Video Story";
  const storyHint =
    content.hashtag.storyHint || "Rekam video dengan bingkai kami, lalu pilih Instagram → Story";
  const lead = content.hashtag.lead || "Abadikan momen bersama kami di Instagram Story";
  const maxSeconds = content.hashtag.boothMaxSeconds ?? 15;
  const explore = hashtagExploreUrl(tag);

  useEffect(() => {
    boothOpenRef.current = boothOpen;
  }, [boothOpen]);

  useEffect(() => {
    if (!template || !tag.trim()) return;

    const releasePreview = () => {
      stopStream(streamRef.current);
      streamRef.current = null;
      const video = videoRef.current;
      if (video) video.srcObject = null;
      setCamReady(false);
    };

    const startPreview = async () => {
      if (boothOpenRef.current || streamRef.current) return;
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
        });
        if (boothOpenRef.current || !inViewRef.current) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => undefined);
        }
        setCamReady(true);
      } catch {
        setCamReady(false);
      }
    };

    const el = phoneRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      inViewRef.current = true;
      void startPreview();
      return () => releasePreview();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
        if (entry?.isIntersecting && !boothOpenRef.current) void startPreview();
        else if (!boothOpenRef.current) releasePreview();
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      releasePreview();
    };
  }, [template, tag]);

  useEffect(() => {
    if (!template) return;
    if (boothOpen) {
      stopStream(streamRef.current);
      streamRef.current = null;
      const video = videoRef.current;
      if (video) video.srcObject = null;
      setCamReady(false);
      return;
    }
    if (inViewRef.current && !streamRef.current && navigator.mediaDevices?.getUserMedia) {
      void navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
        })
        .then(async (stream) => {
          if (boothOpenRef.current || !inViewRef.current) {
            stopStream(stream);
            return;
          }
          streamRef.current = stream;
          const video = videoRef.current;
          if (video) {
            video.srcObject = stream;
            video.muted = true;
            video.playsInline = true;
            await video.play().catch(() => undefined);
          }
          setCamReady(true);
        })
        .catch(() => setCamReady(false));
    }
  }, [boothOpen, template]);

  if (!tag.trim()) return null;

  const openBooth = () => {
    if (!template) return;
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamReady(false);
    onBoothOpen?.();
    setBoothOpen(true);
  };

  const closeBooth = () => {
    setBoothOpen(false);
    onBoothClose?.();
  };

  return (
    <section id="hashtag" className="section hashtag-mod fade-up" aria-label={title}>
      <div className="section__head">
        <h3 className="hashtag-mod__caption">{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <p className="hashtag-mod__lead">{lead}</p>
      {template ? (
        <div className="hashtag-mod__story">
          <button
            ref={phoneRef}
            type="button"
            className="hashtag-mod__phone"
            onClick={openBooth}
            aria-label={boothLabel}
          >
            <video
              ref={videoRef}
              className={`hashtag-mod__phone-cam${camReady ? " is-live" : ""}`}
              playsInline
              muted
              autoPlay
            />
            <img
              className="hashtag-mod__phone-overlay"
              src={template}
              alt=""
              width={270}
              height={480}
              loading="lazy"
              decoding="async"
            />
            {!camReady ? (
              <span className="hashtag-mod__phone-waiting">Menyiapkan kamera…</span>
            ) : null}
          </button>
          <button
            type="button"
            className="btn hashtag-mod__story-btn"
            onClick={openBooth}
            aria-label={boothLabel}
          >
            <IconInstagram size={18} />
            <span>{boothLabel}</span>
          </button>
          <p className="hashtag-mod__story-hint">{storyHint}</p>
        </div>
      ) : null}
      <div className="hashtag-mod__actions">
        <button
          type="button"
          className="hashtag-mod__tag hashtag-mod__tag--pill"
          aria-label={`Salin ${display}`}
          onClick={() => {
            void navigator.clipboard.writeText(display).then(
              () => onToast?.(content.hashtag.copySuccess ?? "Hashtag disalin"),
              () => onToast?.(content.giftUi.copyError || "Gagal menyalin"),
            );
          }}
        >
          {display}
        </button>
        <a
          className="hashtag-mod__ig"
          href={explore}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={content.hashtag.instagramButton || "Instagram"}
        >
          <IconInstagram size={18} />
        </a>
      </div>
      {template ? (
        <StoryBooth
          open={boothOpen}
          overlayUrl={template}
          hashtag={display}
          maxSeconds={maxSeconds}
          shareLabel={content.hashtag.boothShare || "Bagikan ke Story"}
          retryLabel={content.hashtag.boothRetry || "Ulangi"}
          photoFallbackLabel={content.hashtag.storyButton || "Bagikan Foto"}
          deniedMessage={content.hashtag.boothDenied}
          fallbackToast={content.hashtag.storyFallbackToast}
          onClose={closeBooth}
          onToast={onToast}
        />
      ) : null}
    </section>
  );
}
