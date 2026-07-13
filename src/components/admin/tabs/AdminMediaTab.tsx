import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminMediaTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-media-grid">
      <div className="admin-fieldset admin-field--wide admin-media-guide">
        <legend>Panduan Upload Media</legend>
        <p className="admin-media-guide__intro">
          Gunakan dimensi dan rasio yang sama dengan aset saat ini agar tampilan tidak terpotong atau blur.
          Semua ukuran di bawah mengacu pada file di <code>public/assets/</code>.
        </p>
      </div>
      <ImageUploader
        label="Cover / Sampul"
        folder="media"
        spec={MEDIA_SPECS.coverBg}
        value={merged.media.coverBg}
        onChange={(url) => updateDraft(["media", "coverBg"], url)}
      />
      <ImageUploader
        label="Hero Photo"
        folder="media"
        spec={MEDIA_SPECS.heroPhoto}
        value={merged.media.heroPhoto}
        onChange={(url) => {
          updateDraft(["media", "heroPhoto"], url);
          updateDraft(["media", "portrait"], url);
        }}
      />
      <ImageUploader
        label="Video Hero"
        folder="media"
        accept="video/mp4,video/webm"
        spec={MEDIA_SPECS.video}
        value={merged.media.video}
        onChange={(url) => updateDraft(["media", "video"], url)}
      />
      <ImageUploader
        label="Audio"
        folder="media"
        accept="audio/mpeg,audio/mp3"
        spec={MEDIA_SPECS.audio}
        value={merged.media.audio}
        onChange={(url) => updateDraft(["media", "audio"], url)}
      />
      <ImageUploader
        label="Background Desktop"
        folder="media"
        spec={MEDIA_SPECS.desktopBg}
        value={merged.media.desktopBg}
        onChange={(url) => updateDraft(["media", "desktopBg"], url)}
      />
      <ImageUploader
        label="Divider"
        folder="media"
        spec={MEDIA_SPECS.divider}
        value={merged.media.divider}
        onChange={(url) => updateDraft(["media", "divider"], url)}
      />
      <ImageUploader
        label="Rumah Bolon"
        folder="media"
        spec={MEDIA_SPECS.rumahBolon}
        value={merged.media.rumahBolon}
        onChange={(url) => updateDraft(["media", "rumahBolon"], url)}
      />
      <ImageUploader
        label="Bunga Dekorasi"
        folder="media"
        spec={MEDIA_SPECS.bunga}
        value={merged.media.bunga}
        onChange={(url) => updateDraft(["media", "bunga"], url)}
      />
      <ImageUploader
        label="Background Penutup"
        folder="media"
        spec={MEDIA_SPECS.closing}
        value={merged.media.closing}
        onChange={(url) => updateDraft(["media", "closing"], url)}
      />
      <ImageUploader
        label="Tekstur Ulos"
        folder="media"
        spec={MEDIA_SPECS.ulos}
        value={merged.media.ulos}
        onChange={(url) => updateDraft(["media", "ulos"], url)}
      />
      <ImageUploader
        label="OG Image"
        folder="media"
        spec={MEDIA_SPECS.ogImage}
        value={merged.media.ogImage}
        onChange={(url) => updateDraft(["media", "ogImage"], url)}
      />
    </div>
  );
}
