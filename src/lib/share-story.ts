export type ShareStoryResult =
  | { status: "shared" }
  | { status: "fallback"; message?: string }
  | { status: "aborted" }
  | { status: "error"; message: string };

const FILE_NAME = "geraldo-christin-story.png";
const IG_STORY_CAMERA = "instagram://story-camera";
const IG_WEB = "https://instagram.com";
const IG_FALLBACK_MS = 1500;

function normalizeHashtag(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

async function fetchTemplateFile(url: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal memuat template (${res.status})`);
  const blob = await res.blob();
  const type = blob.type || "image/png";
  const ext = type.includes("jpeg") || type.includes("jpg") ? "jpg" : "png";
  const name = FILE_NAME.replace(/\.png$/, `.${ext}`);
  return new File([blob], name, { type });
}

function canShareFiles(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare !== "function") {
    // Older Web Share Level 1: try share with files when share exists.
    return true;
  }
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
  // Revoke after the download has a chance to start.
  window.setTimeout(() => URL.revokeObjectURL(href), 2000);
}

async function copyHashtag(tag: string): Promise<void> {
  const text = normalizeHashtag(tag);
  if (!text || !navigator.clipboard?.writeText) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore clipboard failures in fallback path
  }
}

function openInstagramStoryCamera(): void {
  const started = Date.now();
  const onVis = () => {
    if (document.visibilityState === "hidden") {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  // Attempt deep link; if still visible shortly after, open web IG.
  window.location.href = IG_STORY_CAMERA;
  const timer = window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVis);
    if (document.visibilityState === "visible" && Date.now() - started >= IG_FALLBACK_MS - 50) {
      window.open(IG_WEB, "_blank", "noopener,noreferrer");
    }
  }, IG_FALLBACK_MS);
}

/**
 * Share an Instagram Story template via Web Share (files) when available.
 * Falls back to download + hashtag copy + Instagram deep link.
 */
export async function shareStoryTemplate(
  url: string,
  hashtag: string,
  fallbackToast?: string,
): Promise<ShareStoryResult> {
  if (!url?.trim()) {
    return { status: "error", message: "Template belum tersedia" };
  }

  let file: File;
  try {
    file = await fetchTemplateFile(url);
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Gagal memuat template",
    };
  }

  if (canShareFiles(file)) {
    try {
      await navigator.share({
        files: [file],
        text: normalizeHashtag(hashtag) || undefined,
      });
      return { status: "shared" };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { status: "aborted" };
      }
      // Fall through to download path if share fails for other reasons.
    }
  }

  downloadFile(file);
  await copyHashtag(hashtag);
  openInstagramStoryCamera();
  return {
    status: "fallback",
    message: fallbackToast || "Template tersimpan, buka Instagram lalu pilih dari galeri",
  };
}
