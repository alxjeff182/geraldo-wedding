export type CoverRect = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
};

const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm",
] as const;

/**
 * Pick the best MediaRecorder mime type. Prefer MP4 for Instagram Story.
 */
export function pickRecorderMimeType(
  isSupported: (mime: string) => boolean = (mime) =>
    typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime),
): string {
  for (const mime of MIME_CANDIDATES) {
    try {
      if (isSupported(mime)) return mime;
    } catch {
      // ignore unsupported probe failures
    }
  }
  return "";
}

/** object-fit: cover source crop into a destination box. */
export function coverRect(srcW: number, srcH: number, dstW: number, dstH: number): CoverRect {
  if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) {
    return {
      sx: 0,
      sy: 0,
      sw: Math.max(0, srcW),
      sh: Math.max(0, srcH),
      dx: 0,
      dy: 0,
      dw: dstW,
      dh: dstH,
    };
  }
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  let sx = 0;
  let sy = 0;
  let sw = srcW;
  let sh = srcH;
  if (srcRatio > dstRatio) {
    sw = srcH * dstRatio;
    sx = (srcW - sw) / 2;
  } else {
    sh = srcW / dstRatio;
    sy = (srcH - sh) / 2;
  }
  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: dstW, dh: dstH };
}

export function extensionForMime(mime: string): "mp4" | "webm" {
  const base = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  if (base === "video/mp4" || base.includes("mp4")) return "mp4";
  return "webm";
}

export const CANVAS_W = 720;
export const CANVAS_H = 1280;
export const DEFAULT_MAX_SECONDS = 15;
export const RECORD_FPS = 30;
