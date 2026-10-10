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
    dimensions: "720 × 1280 px",
    width: 720,
    height: 1280,
    ratio: "9:16 (portrait)",
    maxSize: "300 KB",
    maxBytes: 320 * 1024,
    formats: "JPG / WebP",
    notes: "Background sampul & OG image.",
  },
  ogImage: {
    dimensions: "720 × 1280 px",
    width: 720,
    height: 1280,
    ratio: "9:16 atau 1.91:1",
    maxSize: "300 KB",
    maxBytes: 320 * 1024,
    formats: "JPG / WebP",
    notes: "Preview saat share link WhatsApp/sosmed. Bisa sama dengan cover.",
  },
  couplePhoto: {
    dimensions: "640 × 800 px",
    width: 640,
    height: 800,
    ratio: "4:5 (portrait)",
    maxSize: "200 KB",
    maxBytes: 220 * 1024,
    formats: "WebP / JPG",
    notes: "Foto mempelai di kartu couple story.",
  },
  galleryPhoto: {
    dimensions: "1080 × 1350 px",
    width: 1080,
    height: 1350,
    ratio: "4:5 (portrait)",
    maxSize: "350 KB",
    maxBytes: 380 * 1024,
    formats: "WebP / JPG",
    notes: "Foto galeri orbit ring.",
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
    notes: "Foto hashtag (opsional).",
  },
  logo: {
    dimensions: "512 × 512 px",
    width: 512,
    height: 512,
    ratio: "1:1",
    maxSize: "200 KB",
    maxBytes: 220 * 1024,
    formats: "PNG (transparan)",
    notes: "Monogram logo di cover & footer.",
  },
  openingVideo: {
    dimensions: "720 × 1280 px",
    width: 720,
    height: 1280,
    ratio: "9:16 (portrait)",
    maxSize: "5 MB",
    maxBytes: 5 * 1024 * 1024,
    formats: "MP4 (H.264)",
    notes: "Video pembuka pintu.",
  },
  heroVideo: {
    dimensions: "720 × 1280 px",
    width: 720,
    height: 1280,
    ratio: "9:16 (portrait)",
    maxSize: "3 MB",
    maxBytes: 3 * 1024 * 1024,
    formats: "MP4 (H.264)",
    notes: "Video hero section pertama (autoplay muted).",
  },
  heroPoster: {
    dimensions: "720 × 1280 px",
    width: 720,
    height: 1280,
    ratio: "9:16 (portrait)",
    maxSize: "300 KB",
    maxBytes: 320 * 1024,
    formats: "JPG / WebP",
    notes: "Poster hero sebelum video siap diputar.",
  },
  qris: {
    dimensions: "800 × 800 px",
    width: 800,
    height: 800,
    ratio: "1:1",
    maxSize: "300 KB",
    maxBytes: 320 * 1024,
    formats: "PNG / JPG",
    notes: "Gambar QRIS untuk gift. Kosongkan jika belum tersedia.",
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

export async function validateMediaFile(file: File, spec: MediaSpec): Promise<string | null> {
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

    if (
      ratioDiff > DIMENSION_TOLERANCE ||
      (widthDiff > DIMENSION_TOLERANCE && heightDiff > DIMENSION_TOLERANCE)
    ) {
      return `Dimensi ${width}×${height}px tidak sesuai rekomendasi ${spec.dimensions} (${spec.ratio}).`;
    }
  } catch {
    return null;
  }

  return null;
}
