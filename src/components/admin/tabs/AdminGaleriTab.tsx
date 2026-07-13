import { AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminGaleriTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-stack">
      <AdminTextField
        label="Judul"
        value={merged.gallery.title}
        onChange={(value) => updateDraft(["gallery", "title"], value)}
      />
      <AdminTextField
        label="Subtitle"
        wide
        value={merged.gallery.subtitle}
        onChange={(value) => updateDraft(["gallery", "subtitle"], value)}
        rows={2}
      />
      {merged.gallery.images.map((img, index) => (
        <div key={index} className="admin-gallery-row admin-fieldset">
          <ImageUploader
            label={`Foto ${index + 1}`}
            folder="gallery"
            spec={MEDIA_SPECS.galleryPhoto}
            value={img.src}
            onChange={(url) => {
              const images = merged.gallery.images.map((item, i) =>
                i === index ? { ...item, src: url } : item,
              ) as { src: string; alt: string }[];
              updateDraft(["gallery", "images"], images);
            }}
          />
          <label className="admin-field">
            <span className="admin-label">Alt text</span>
            <input
              className="admin-input"
              value={img.alt}
              onChange={(e) => {
                const images = merged.gallery.images.map((item, i) =>
                  i === index ? { ...item, alt: e.target.value } : item,
                ) as { src: string; alt: string }[];
                updateDraft(["gallery", "images"], images);
              }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
