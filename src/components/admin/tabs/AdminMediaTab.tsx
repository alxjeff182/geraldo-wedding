import { AdminOverrideMediaField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminMediaTab({ merged, defaults, updateDraft, clearDraftPath }: AdminTabProps) {
  return (
    <div className="admin-media-grid">
      <div className="admin-fieldset admin-field--wide admin-media-guide">
        <legend>Panduan Upload Media</legend>
        <p className="admin-media-guide__intro">
          Gunakan dimensi dan rasio yang sama dengan aset ballroom agar tampilan tidak terpotong
          atau blur. Semua ukuran di bawah mengacu pada file di <code>public/assets/ballroom/</code>
          .
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
        label="Video Hero"
        folder="media"
        accept="video/mp4,video/webm"
        spec={MEDIA_SPECS.heroVideo}
        value={merged.media.heroVideo ?? ""}
        onChange={(url) => updateDraft(["media", "heroVideo"], url)}
      />
      <ImageUploader
        label="Hero Poster"
        folder="media"
        spec={MEDIA_SPECS.heroPoster}
        value={merged.media.heroPoster ?? ""}
        onChange={(url) => updateDraft(["media", "heroPoster"], url)}
      />
      <AdminOverrideMediaField
        label="Audio"
        value={merged.media.audio}
        defaultValue={defaults.media.audio}
        onReset={() => clearDraftPath(["media", "audio"])}
      >
        <ImageUploader
          label=""
          folder="media"
          accept="audio/mpeg,audio/mp3"
          spec={MEDIA_SPECS.audio}
          value={merged.media.audio}
          onChange={(url) => updateDraft(["media", "audio"], url)}
        />
      </AdminOverrideMediaField>
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
