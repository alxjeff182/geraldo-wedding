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

export type FitMode = "cover" | "fit";

const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm",
] as const;

const COVER_KEEP_MIN = 0.6;

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

/** object-fit: contain — full source, letterboxed into destination. */
export function containRect(srcW: number, srcH: number, dstW: number, dstH: number): CoverRect {
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
  let dw = dstW;
  let dh = dstH;
  let dx = 0;
  let dy = 0;
  if (srcRatio > dstRatio) {
    dw = dstW;
    dh = dstW / srcRatio;
    dy = (dstH - dh) / 2;
  } else {
    dh = dstH;
    dw = dstH * srcRatio;
    dx = (dstW - dw) / 2;
  }
  return { sx: 0, sy: 0, sw: srcW, sh: srcH, dx, dy, dw, dh };
}

/**
 * Prefer cover when it keeps enough of the source; otherwise fit (less zoom).
 */
export function fitMode(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
  keepMin = COVER_KEEP_MIN,
): FitMode {
  if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) return "fit";
  const crop = coverRect(srcW, srcH, dstW, dstH);
  const kept = (crop.sw * crop.sh) / (srcW * srcH);
  return kept >= keepMin ? "cover" : "fit";
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
