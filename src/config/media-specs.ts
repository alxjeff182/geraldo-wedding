export type MediaSpec = {
  /** Human-readable size label, e.g. "640 × 1137 px" */
  dimensions: string;
  /** Target width in pixels (from current production asset) */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Allowed aspect ratio label */
  ratio: string;
  /** Max file size label */
  maxSize: string;
  maxBytes: number;
  formats: string;
  notes?: string;
};

export const MEDIA_SPECS = {
  coverBg: {
    dimensions: "640 × 1137 px",
    width: 640,
    height: 1137,
    ratio: "9:16 (portrait)",
    maxSize: "300 KB",
    maxBytes: 320 * 1024,
    formats: "JPG / WebP",
    notes: "Background sampul & OG image. Sama seperti batak-sampul.jpg saat ini.",
  },
  heroPhoto: {
    dimensions: "576 × 1024 px",
    width: 576,
    height: 1024,
    ratio: "9:16 (portrait)",
    maxSize: "250 KB",
    maxBytes: 280 * 1024,
    formats: "WebP / PNG",
    notes: "Foto hero fullscreen setelah video. Ideal 1080×1920 untuk retina.",
  },
  desktopBg: {
    dimensions: "1080 × 1920 px",
    width: 1080,
    height: 1920,
    ratio: "9:16 (portrait)",
    maxSize: "900 KB",
    maxBytes: 950 * 1024,
    formats: "JPG / WebP",
    notes: "Background sidebar desktop & section mempelai.",
  },
  rumahBolon: {
    dimensions: "594 × 736 px",
    width: 594,
    height: 736,
    ratio: "≈ 4:5",
    maxSize: "450 KB",
    maxBytes: 480 * 1024,
    formats: "PNG (transparan)",
    notes: "Ikon rumah bolon di sampul & countdown.",
  },
  bunga: {
    dimensions: "632 × 672 px",
    width: 632,
    height: 672,
    ratio: "≈ 1:1",
    maxSize: "400 KB",
    maxBytes: 420 * 1024,
    formats: "PNG (transparan)",
    notes: "Dekorasi bunga guestbook & countdown.",
  },
  divider: {
    dimensions: "2000 × 460 px",
    width: 2000,
    height: 460,
    ratio: "≈ 4.3:1 (landscape lebar)",
    maxSize: "180 KB",
    maxBytes: 200 * 1024,
    formats: "PNG / WebP",
    notes: "Ornamen pemisah antar section. Tampil max lebar 320px.",
  },
  closing: {
    dimensions: "1080 × 1920 px",
    width: 1080,
    height: 1920,
    ratio: "9:16 (portrait)",
    maxSize: "1 MB",
    maxBytes: 1024 * 1024,
    formats: "JPG / WebP",
    notes: "Background section penutup.",
  },
  ulos: {
    dimensions: "1080 × 1920 px",
    width: 1080,
    height: 1920,
    ratio: "9:16 (portrait)",
    maxSize: "800 KB",
    maxBytes: 850 * 1024,
    formats: "JPG / WebP",
    notes: "Tekstur ulos section countdown.",
  },
  ogImage: {
    dimensions: "640 × 1137 px",
    width: 640,
    height: 1137,
    ratio: "9:16 atau 1.91:1",
    maxSize: "300 KB",
    maxBytes: 320 * 1024,
    formats: "JPG / WebP",
    notes: "Preview saat share link WhatsApp/sosmed. Bisa sama dengan cover.",
  },
  couplePhoto: {
    dimensions: "640 × 560 px",
    width: 640,
    height: 560,
    ratio: "8:7 (portrait)",
    maxSize: "200 KB",
    maxBytes: 220 * 1024,
    formats: "WebP / JPG",
    notes: "Foto mempelai di section couple. Tampil 320×280px, crop center.",
  },
  galleryPhoto: {
    dimensions: "1080 × 1350 px",
    width: 1080,
    height: 1350,
    ratio: "4:5 (portrait)",
    maxSize: "350 KB",
    maxBytes: 380 * 1024,
    formats: "WebP / JPG",
    notes: "Foto galeri utama & grid. Thumbnail 4:3, utama tinggi 450px.",
  },
  giftLogo: {
    dimensions: "1024 × 433 px",
    width: 1024,
    height: 433,
    ratio: "≈ 2.4:1 (landscape)",
    maxSize: "200 KB",
    maxBytes: 220 * 1024,
    formats: "PNG",
    notes: "Logo bank. Tampil max lebar 140px.",
  },
  hashtagPhoto: {
    dimensions: "850 × 898 px",
    width: 850,
    height: 898,
    ratio: "≈ 1:1",
    maxSize: "300 KB",
    maxBytes: 320 * 1024,
    formats: "WebP / JPG",
    notes: "Foto di lengkungan hashtag penutup. Min tinggi area 312px.",
  },
  video: {
    dimensions: "1080 × 1920 px",
    width: 1080,
    height: 1920,
    ratio: "9:16 (portrait)",
    maxSize: "5 MB",
    maxBytes: 5 * 1024 * 1024,
    formats: "MP4 (H.264)",
    notes: "Video intro hero. Durasi singkat, tanpa audio atau audio terpisah.",
  },
  audio: {
    dimensions: "—",
    ratio: "—",
    maxSize: "3 MB",
    maxBytes: 3 * 1024 * 1024,
    formats: "MP3",
    notes: "Musik latar undangan. Loop-friendly.",
  },
} as const satisfies Record<string, MediaSpec>;

export type MediaSpecKey = keyof typeof MEDIA_SPECS;

const DIMENSION_TOLERANCE = 0.2;

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    img.src = url;
  });
}

function loadVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid video"));
    };
    video.src = url;
  });
}

export function formatMediaSpec(spec: MediaSpec): string {
  const parts = [
    `Ukuran: ${spec.dimensions}`,
    `Rasio: ${spec.ratio}`,
    `Maks: ${spec.maxSize}`,
    `Format: ${spec.formats}`,
  ];
  if (spec.notes) parts.push(spec.notes);
  return parts.join(" · ");
}

export async function validateMediaFile(
  file: File,
  spec: MediaSpec,
): Promise<string | null> {
  if (file.size > spec.maxBytes) {
    return `File terlalu besar (maks. ${spec.maxSize}). Kompres atau gunakan WebP.`;
  }

  if (!spec.width || !spec.height) return null;

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");

  if (!isImage && !isVideo) return null;

  try {
    const { width, height } = isVideo
      ? await loadVideoDimensions(file)
      : await loadImageDimensions(file);

    const targetRatio = spec.width / spec.height;
    const actualRatio = width / height;
    const ratioDiff = Math.abs(targetRatio - actualRatio) / targetRatio;

    const widthDiff = Math.abs(width - spec.width) / spec.width;
    const heightDiff = Math.abs(height - spec.height) / spec.height;

    if (ratioDiff > DIMENSION_TOLERANCE || (widthDiff > DIMENSION_TOLERANCE && heightDiff > DIMENSION_TOLERANCE)) {
      return `Dimensi ${width}×${height}px tidak sesuai rekomendasi ${spec.dimensions} (${spec.ratio}).`;
    }
  } catch {
    return null;
  }

  return null;
}
