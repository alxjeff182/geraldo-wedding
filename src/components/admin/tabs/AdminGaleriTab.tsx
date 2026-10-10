import { AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

const GALLERY_PLACEHOLDER = "/assets/ballroom/gallery-placeholder.svg";

export function AdminGaleriTab({ merged, updateDraft }: AdminTabProps) {
  const images = merged.gallery.images;

  const setImages = (next: { src: string; alt: string }[]) => {
    updateDraft(["gallery", "images"], next);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
  };

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
      {images.map((img, index) => (
        <div key={index} className="admin-gallery-row admin-fieldset">
          <div className="admin-gallery-row__toolbar">
            <span className="admin-label">Foto {index + 1}</span>
            <div className="admin-gallery-row__actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                disabled={index === 0}
                onClick={() => moveImage(index, -1)}
              >
                Naik
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                disabled={index === images.length - 1}
                onClick={() => moveImage(index, 1)}
              >
                Turun
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--danger admin-btn--sm"
                onClick={() => setImages(images.filter((_, i) => i !== index))}
              >
                Hapus
              </button>
            </div>
          </div>
          <ImageUploader
            label={`Upload foto ${index + 1}`}
            folder="gallery"
            spec={MEDIA_SPECS.galleryPhoto}
            value={img.src}
            onChange={(url) => {
              setImages(images.map((item, i) => (i === index ? { ...item, src: url } : item)));
            }}
          />
          <label className="admin-field">
            <span className="admin-label">Alt text</span>
            <input
              className="admin-input"
              value={img.alt}
              onChange={(e) => {
                setImages(
                  images.map((item, i) => (i === index ? { ...item, alt: e.target.value } : item)),
                );
              }}
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        onClick={() => setImages([...images, { src: GALLERY_PLACEHOLDER, alt: "Foto baru" }])}
      >
        Tambah foto
      </button>
    </div>
  );
}
