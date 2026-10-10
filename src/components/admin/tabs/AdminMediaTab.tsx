import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminMediaTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-media-grid">
      <div className="admin-fieldset admin-field--wide admin-media-guide">
        <legend>Panduan Upload Media</legend>
        <p className="admin-media-guide__intro">
          Gunakan dimensi dan rasio yang sama dengan aset ballroom agar tampilan tidak terpotong atau blur.
          Semua ukuran di bawah mengacu pada file di <code>public/assets/ballroom/</code>.
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
        label="Logo Monogram"
        folder="media"
        spec={MEDIA_SPECS.logo}
        value={merged.media.logo}
        onChange={(url) => updateDraft(["media", "logo"], url)}
      />
      <ImageUploader
        label="Video Opening (pintu)"
        folder="media"
        accept="video/mp4,video/webm"
        spec={MEDIA_SPECS.openingVideo}
        value={merged.media.openingVideo}
        onChange={(url) => updateDraft(["media", "openingVideo"], url)}
      />
      <ImageUploader
        label="Hero Poster"
        folder="media"
        spec={MEDIA_SPECS.heroPoster}
        value={merged.media.heroPoster ?? ""}
        onChange={(url) => updateDraft(["media", "heroPoster"], url)}
      />
      <label className="admin-field">
        <span className="admin-label">Hero Frames Base Path</span>
        <input
          className="admin-input"
          value={merged.media.heroFramesBase}
          onChange={(e) => updateDraft(["media", "heroFramesBase"], e.target.value)}
        />
      </label>
      <label className="admin-field">
        <span className="admin-label">Jumlah Hero Frames</span>
        <input
          className="admin-input"
          type="number"
          min={1}
          max={60}
          value={merged.media.heroFrameCount}
          onChange={(e) => updateDraft(["media", "heroFrameCount"], Number(e.target.value) || 24)}
        />
      </label>
      <ImageUploader
        label="Audio"
        folder="media"
        accept="audio/mpeg,audio/mp3"
        spec={MEDIA_SPECS.audio}
        value={merged.media.audio}
        onChange={(url) => updateDraft(["media", "audio"], url)}
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
