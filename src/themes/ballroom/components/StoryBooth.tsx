import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shareStoryTemplate } from "../../../lib/share-story";
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_MAX_SECONDS,
  RECORD_FPS,
  type FitMode,
  containRect,
  coverRect,
  extensionForMime,
  fitMode as pickFitMode,
  pickRecorderMimeType,
} from "../../../lib/story-recorder";
import { IconCameraFlip, IconInstagram, IconRedo, IconX } from "../icons";

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

function normalizeHashtag(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function probeCanShare(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return true;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function downloadFile(file: File): void {
  const href = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = href;
  a.download = file.name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 2000);
}

async function applyWidestZoom(track: MediaStreamTrack) {
  try {
    const caps = track.getCapabilities?.() as MediaTrackCapabilities & { zoom?: { min: number } };
    if (!caps?.zoom || typeof caps.zoom.min !== "number") return;
    await track.applyConstraints({
      advanced: [{ zoom: caps.zoom.min } as MediaTrackConstraintSet],
    });
  } catch {
    // Zoom constraint unsupported — ignore.
  }
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
  const modeRef = useRef<FitMode>("fit");
  const recordStartedRef = useRef(0);
  const clipUrlRef = useRef<string | null>(null);
  const clipFileRef = useRef<File | null>(null);
  const maxMs = Math.max(3, maxSeconds) * 1000;

  const [phase, setPhase] = useState<Phase>("loading");
  const [facing, setFacing] = useState<Facing>("user");
  const [mode, setMode] = useState<FitMode>("fit");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [canShareClip, setCanShareClip] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const setClip = useCallback((url: string | null, file: File | null = null) => {
    if (clipUrlRef.current && clipUrlRef.current !== url) {
      URL.revokeObjectURL(clipUrlRef.current);
    }
    clipUrlRef.current = url;
    clipFileRef.current = file;
    setClipUrl(url);
    setCanShareClip(file ? probeCanShare(file) : false);
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
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const mirror = facingRef.current === "user";
      const currentMode = modeRef.current;

      ctx.save();
      if (mirror) {
        ctx.translate(CANVAS_W, 0);
        ctx.scale(-1, 1);
      }

      if (currentMode === "fit") {
        const cover = coverRect(vw, vh, CANVAS_W, CANVAS_H);
        ctx.save();
        try {
          ctx.filter = "blur(24px) brightness(0.55)";
        } catch {
          // filter unsupported
        }
        ctx.drawImage(
          video,
          cover.sx,
          cover.sy,
          cover.sw,
          cover.sh,
          cover.dx,
          cover.dy,
          cover.dw,
          cover.dh,
        );
        ctx.restore();
        ctx.fillStyle = "rgba(8, 5, 4, 0.35)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        const fit = containRect(vw, vh, CANVAS_W, CANVAS_H);
        ctx.drawImage(video, fit.sx, fit.sy, fit.sw, fit.sh, fit.dx, fit.dy, fit.dw, fit.dh);
      } else {
        const cover = coverRect(vw, vh, CANVAS_W, CANVAS_H);
        ctx.drawImage(
          video,
          cover.sx,
          cover.sy,
          cover.sw,
          cover.sh,
          cover.dx,
          cover.dy,
          cover.dw,
          cover.dh,
        );
      }
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
      setStatus(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: { ideal: nextFacing },
            // Prefer full-sensor 4:3 over a cropped 9:16 stream (less digital zoom).
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
        });
        streamRef.current = stream;
        facingRef.current = nextFacing;
        setFacing(nextFacing);

        const track = stream.getVideoTracks()[0];
        if (track) await applyWidestZoom(track);

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => undefined);
          // Wait a tick for videoWidth/Height
          await new Promise((r) => requestAnimationFrame(() => r(undefined)));
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            const auto = pickFitMode(video.videoWidth, video.videoHeight, CANVAS_W, CANVAS_H);
            modeRef.current = auto;
            setMode(auto);
          }
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
      clipFileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/close only
  }, [open]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (phase !== "recording") return;
    const id = window.setInterval(() => {
      const ms = Date.now() - recordStartedRef.current;
      setElapsedMs(ms);
      if (ms >= maxMs) stopRecording();
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, maxMs, stopRecording]);

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

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      mixed.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: usedMime });
      const ext = extensionForMime(usedMime);
      const file = new File([blob], `geraldo-christin-story.${ext}`, {
        type: blob.type || usedMime,
      });
      setClip(URL.createObjectURL(blob), file);
      setStatus(null);
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
    setClip(null, null);
    setStatus(null);
    setPhase("live");
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(drawFrame);
    }
  }, [drawFrame, setClip]);

  const flipCamera = useCallback(() => {
    if (phase === "recording") return;
    const next: Facing = facing === "user" ? "environment" : "user";
    void startCamera(next);
  }, [facing, phase, startCamera]);

  const toggleMode = useCallback(() => {
    if (phase === "recording") return;
    const next: FitMode = modeRef.current === "cover" ? "fit" : "cover";
    modeRef.current = next;
    setMode(next);
  }, [phase]);

  const shareClip = useCallback(() => {
    const file = clipFileRef.current;
    if (!file || sharing) return;

    // Download path when Web Share files are unavailable (honest UI).
    if (!canShareClip) {
      downloadFile(file);
      void navigator.clipboard?.writeText?.(normalizeHashtag(hashtag)).catch(() => undefined);
      setStatus(fallbackToast || "Video tersimpan. Upload dari galeri ke Instagram Story.");
      return;
    }

    setSharing(true);
    setStatus(null);
    // Call share synchronously on the tap — no await before this (iOS gesture).
    const sharePromise = navigator.share({
      files: [file],
      text: normalizeHashtag(hashtag) || undefined,
    });

    void sharePromise
      .then(() => {
        onClose();
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          setSharing(false);
          return;
        }
        setStatus("Gagal membagikan. Coba Simpan Video, lalu upload ke Instagram.");
        setSharing(false);
      });
  }, [canShareClip, fallbackToast, hashtag, onClose, sharing]);

  const saveClip = useCallback(() => {
    const file = clipFileRef.current;
    if (!file) return;
    downloadFile(file);
    void navigator.clipboard?.writeText?.(normalizeHashtag(hashtag)).catch(() => undefined);
    setStatus(fallbackToast || "Video tersimpan. Upload dari galeri ke Instagram Story.");
  }, [fallbackToast, hashtag]);

  const sharePhotoFallback = useCallback(async () => {
    setSharing(true);
    setStatus(null);
    try {
      const result = await shareStoryTemplate(overlayUrl, hashtag, fallbackToast);
      if (result.status === "fallback" && result.message) {
        setStatus(result.message);
        onToast?.(result.message);
      } else if (result.status === "error") {
        setStatus(result.message);
        onToast?.(result.message);
      } else if (result.status === "shared") {
        onClose();
      }
    } finally {
      setSharing(false);
    }
  }, [fallbackToast, hashtag, onClose, onToast, overlayUrl]);

  if (!open) return null;

  const progress = Math.min(1, elapsedMs / maxMs);
  const secondsLeft = Math.max(0, Math.ceil((maxMs - elapsedMs) / 1000));
  const primaryLabel = canShareClip ? shareLabel : "Simpan Video";

  return createPortal(
    <div
      className="theme-ballroom booth"
      role="dialog"
      aria-modal="true"
      aria-label="Rekam Video Story"
    >
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
            <div className="booth__chrome-right">
              <button
                type="button"
                className="booth__chip"
                onClick={toggleMode}
                disabled={phase === "recording"}
                aria-label={mode === "cover" ? "Mode penuh" : "Mode pas"}
              >
                {mode === "cover" ? "Penuh" : "Pas"}
              </button>
              <button
                type="button"
                className="booth__icon-btn"
                aria-label="Ganti kamera"
                onClick={flipCamera}
                disabled={phase === "recording"}
              >
                <IconCameraFlip size={18} />
              </button>
            </div>
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
              className="booth__btn booth__btn--primary"
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
          <div className="booth__review-bar">
            {!canShareClip ? (
              <p className="booth__review-hint">Lalu upload dari galeri ke Instagram Story</p>
            ) : null}
            {status ? (
              <p className="booth__inline-status" role="status">
                {status}
              </p>
            ) : null}
            <div className="booth__review-actions">
              <button type="button" className="booth__btn booth__btn--ghost" onClick={retry}>
                <IconRedo size={18} />
                <span>{retryLabel}</span>
              </button>
              <button
                type="button"
                className="booth__btn booth__btn--primary"
                disabled={sharing}
                onClick={shareClip}
              >
                <IconInstagram size={18} />
                <span>{sharing ? "Menyiapkan…" : primaryLabel}</span>
              </button>
            </div>
            {canShareClip ? (
              <button type="button" className="booth__text-link" onClick={saveClip}>
                Atau simpan video
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
