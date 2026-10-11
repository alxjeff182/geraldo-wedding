import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shareStoryFile, shareStoryTemplate } from "../../../lib/share-story";
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_MAX_SECONDS,
  RECORD_FPS,
  coverRect,
  extensionForMime,
  pickRecorderMimeType,
} from "../../../lib/story-recorder";
import { IconCameraFlip, IconInstagram, IconX } from "../icons";

type Facing = "user" | "environment";
type Phase = "loading" | "live" | "recording" | "review" | "error";

type Props = {
  open: boolean;
  overlayUrl: string;
  hashtag: string;
  maxSeconds?: number;
  shareLabel?: string;
  retryLabel?: string;
  photoFallbackLabel?: string;
  deniedMessage?: string;
  fallbackToast?: string;
  onClose: () => void;
  onToast?: (msg: string) => void;
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

export function StoryBooth({
  open,
  overlayUrl,
  hashtag,
  maxSeconds = DEFAULT_MAX_SECONDS,
  shareLabel = "Bagikan ke Story",
  retryLabel = "Ulangi",
  photoFallbackLabel = "Bagikan Foto",
  deniedMessage = "Kamera tidak tersedia. Bagikan foto template saja.",
  fallbackToast,
  onClose,
  onToast,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef(0);
  const overlayRef = useRef<HTMLImageElement | null>(null);
  const facingRef = useRef<Facing>("user");
  const recordStartedRef = useRef(0);
  const clipUrlRef = useRef<string | null>(null);
  const maxMs = Math.max(3, maxSeconds) * 1000;

  const [phase, setPhase] = useState<Phase>("loading");
  const [facing, setFacing] = useState<Facing>("user");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [clipMime, setClipMime] = useState("video/mp4");
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setClip = useCallback((url: string | null) => {
    if (clipUrlRef.current && clipUrlRef.current !== url) {
      URL.revokeObjectURL(clipUrlRef.current);
    }
    clipUrlRef.current = url;
    setClipUrl(url);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const { sx, sy, sw, sh, dx, dy, dw, dh } = coverRect(
        video.videoWidth,
        video.videoHeight,
        CANVAS_W,
        CANVAS_H,
      );
      ctx.save();
      if (facingRef.current === "user") {
        ctx.translate(CANVAS_W, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.restore();

      const overlay = overlayRef.current;
      if (overlay?.complete && overlay.naturalWidth > 0) {
        ctx.drawImage(overlay, 0, 0, CANVAS_W, CANVAS_H);
      }
    }

    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  const startCamera = useCallback(
    async (nextFacing: Facing) => {
      stopLoop();
      stopStream(streamRef.current);
      streamRef.current = null;
      setPhase("loading");
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
        });
        streamRef.current = stream;
        facingRef.current = nextFacing;
        setFacing(nextFacing);

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => undefined);
        }

        stopLoop();
        rafRef.current = requestAnimationFrame(drawFrame);
        setPhase("live");
      } catch {
        setError(deniedMessage);
        setPhase("error");
      }
    },
    [deniedMessage, drawFrame, stopLoop],
  );

  // Open / close lifecycle
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const img = new Image();
    img.decoding = "async";
    img.src = overlayUrl;
    overlayRef.current = img;

    void startCamera("user");

    return () => {
      document.body.style.overflow = prevOverflow;
      stopLoop();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      recorderRef.current = null;
      stopStream(streamRef.current);
      streamRef.current = null;
      if (clipUrlRef.current) {
        URL.revokeObjectURL(clipUrlRef.current);
        clipUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/close only
  }, [open]);

  // Elapsed timer while recording
  useEffect(() => {
    if (phase !== "recording") return;
    const id = window.setInterval(() => {
      const ms = Date.now() - recordStartedRef.current;
      setElapsedMs(ms);
      if (ms >= maxMs) {
        stopRecording();
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, maxMs]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
  }, []);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    const cam = streamRef.current;
    if (!canvas || !cam || phase !== "live") return;
    if (typeof canvas.captureStream !== "function" || typeof MediaRecorder === "undefined") {
      setError(deniedMessage);
      setPhase("error");
      return;
    }

    const mime = pickRecorderMimeType();
    const canvasStream = canvas.captureStream(RECORD_FPS);
    const mixed = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...cam.getAudioTracks().map((t) => t.clone()),
    ]);

    chunksRef.current = [];
    let recorder: MediaRecorder;
    try {
      recorder = mime
        ? new MediaRecorder(mixed, { mimeType: mime, videoBitsPerSecond: 2_500_000 })
        : new MediaRecorder(mixed);
    } catch {
      setError(deniedMessage);
      setPhase("error");
      mixed.getTracks().forEach((t) => t.stop());
      return;
    }

    const usedMime = recorder.mimeType || mime || "video/webm";
    setClipMime(usedMime);

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      mixed.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: usedMime });
      setClip(URL.createObjectURL(blob));
      setPhase("review");
      setElapsedMs(0);
    };

    recorderRef.current = recorder;
    recordStartedRef.current = Date.now();
    setElapsedMs(0);
    recorder.start(250);
    setPhase("recording");
  }, [deniedMessage, phase, setClip]);

  const retry = useCallback(() => {
    setClip(null);
    setPhase("live");
    // ensure draw loop is running
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(drawFrame);
    }
  }, [drawFrame, setClip]);

  const flipCamera = useCallback(() => {
    if (phase === "recording") return;
    const next: Facing = facing === "user" ? "environment" : "user";
    void startCamera(next);
  }, [facing, phase, startCamera]);

  const shareClip = useCallback(async () => {
    if (!clipUrl || sharing) return;
    setSharing(true);
    try {
      const res = await fetch(clipUrl);
      const blob = await res.blob();
      const ext = extensionForMime(clipMime);
      const file = new File([blob], `geraldo-christin-story.${ext}`, {
        type: blob.type || clipMime,
      });
      const result = await shareStoryFile(
        file,
        hashtag,
        fallbackToast || "Video tersimpan, buka Instagram lalu pilih dari galeri",
      );
      if (result.status === "fallback" && result.message) onToast?.(result.message);
      if (result.status === "error") onToast?.(result.message);
      if (result.status === "shared") onClose();
    } catch {
      onToast?.("Gagal membagikan video");
    } finally {
      setSharing(false);
    }
  }, [clipMime, clipUrl, fallbackToast, hashtag, onClose, onToast, sharing]);

  const sharePhotoFallback = useCallback(async () => {
    setSharing(true);
    try {
      const result = await shareStoryTemplate(overlayUrl, hashtag, fallbackToast);
      if (result.status === "fallback" && result.message) onToast?.(result.message);
      if (result.status === "error") onToast?.(result.message);
      if (result.status === "shared") onClose();
    } finally {
      setSharing(false);
    }
  }, [fallbackToast, hashtag, onClose, onToast, overlayUrl]);

  if (!open) return null;

  const progress = Math.min(1, elapsedMs / maxMs);
  const secondsLeft = Math.max(0, Math.ceil((maxMs - elapsedMs) / 1000));

  return createPortal(
    <div className="booth" role="dialog" aria-modal="true" aria-label="Rekam Video Story">
      <div className="booth__stage">
        <video ref={videoRef} className="booth__cam" playsInline muted autoPlay />
        <canvas
          ref={canvasRef}
          className={`booth__canvas${phase === "review" ? " is-hidden" : ""}`}
          width={CANVAS_W}
          height={CANVAS_H}
        />
        {phase === "review" && clipUrl ? (
          <video
            ref={reviewRef}
            className="booth__review"
            src={clipUrl}
            playsInline
            loop
            autoPlay
            controls={false}
          />
        ) : null}

        <div className="booth__chrome">
          <button type="button" className="booth__icon-btn" aria-label="Tutup" onClick={onClose}>
            <IconX size={18} />
          </button>
          {phase === "live" || phase === "recording" ? (
            <button
              type="button"
              className="booth__icon-btn"
              aria-label="Ganti kamera"
              onClick={flipCamera}
              disabled={phase === "recording"}
            >
              <IconCameraFlip size={18} />
            </button>
          ) : (
            <span className="booth__icon-spacer" />
          )}
        </div>

        {phase === "loading" ? <p className="booth__status">Menyiapkan kamera…</p> : null}

        {phase === "error" ? (
          <div className="booth__error">
            <p>{error || deniedMessage}</p>
            <button
              type="button"
              className="btn booth__share-btn"
              disabled={sharing}
              onClick={() => void sharePhotoFallback()}
            >
              <IconInstagram size={18} />
              <span>{sharing ? "Menyiapkan…" : photoFallbackLabel}</span>
            </button>
          </div>
        ) : null}

        {phase === "live" || phase === "recording" ? (
          <div className="booth__controls">
            {phase === "recording" ? (
              <p className="booth__timer" aria-live="polite">
                {secondsLeft}s
              </p>
            ) : (
              <p className="booth__tip">Tekan untuk merekam (max {maxSeconds}s)</p>
            )}
            <button
              type="button"
              className={`booth__rec${phase === "recording" ? " is-rec" : ""}`}
              aria-label={phase === "recording" ? "Stop rekaman" : "Mulai rekaman"}
              onClick={() => {
                if (phase === "recording") stopRecording();
                else startRecording();
              }}
            >
              <svg className="booth__ring" viewBox="0 0 72 72" aria-hidden="true">
                <circle cx="36" cy="36" r="32" className="booth__ring-track" />
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  className="booth__ring-fill"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 32}`,
                    strokeDashoffset: `${2 * Math.PI * 32 * (1 - progress)}`,
                  }}
                />
              </svg>
              <span className="booth__rec-core" />
            </button>
          </div>
        ) : null}

        {phase === "review" ? (
          <div className="booth__review-actions">
            <button type="button" className="btn btn--ghost booth__retry" onClick={retry}>
              {retryLabel}
            </button>
            <button
              type="button"
              className="btn booth__share-btn"
              disabled={sharing}
              onClick={() => void shareClip()}
            >
              <IconInstagram size={18} />
              <span>{sharing ? "Menyiapkan…" : shareLabel}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
