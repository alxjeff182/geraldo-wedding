import { AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminPenutupTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-stack">
      <fieldset className="admin-fieldset">
        <legend>Ayat</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Ayat Alkitab"
            wide
            value={merged.bibleQuote}
            onChange={(value) => updateDraft(["bibleQuote"], value)}
            rows={3}
          />
          <AdminTextField
            label="Referensi Ayat"
            value={merged.bibleReference}
            onChange={(value) => updateDraft(["bibleReference"], value)}
          />
        </div>
      </fieldset>
      <fieldset className="admin-fieldset">
        <legend>Hashtag</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Judul"
            value={merged.hashtag.title}
            onChange={(value) => updateDraft(["hashtag", "title"], value)}
          />
          <AdminTextField
            label="Tag"
            value={merged.hashtag.tag}
            onChange={(value) => updateDraft(["hashtag", "tag"], value)}
          />
          <AdminTextField
            label="Label Tombol Story"
            value={merged.hashtag.storyButton ?? ""}
            onChange={(value) => updateDraft(["hashtag", "storyButton"], value)}
          />
        </div>
        <ImageUploader
          label="Template Instagram Story (1080×1920)"
          folder="hashtag"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          spec={MEDIA_SPECS.storyTemplate}
          value={merged.hashtag.storyTemplate ?? ""}
          onChange={(url) => updateDraft(["hashtag", "storyTemplate"], url)}
        />
      </fieldset>
      <fieldset className="admin-fieldset">
        <legend>Footer & Shortcut Dock</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Footer Prefix"
            value={merged.footer.creditPrefix}
            onChange={(value) => updateDraft(["footer", "creditPrefix"], value)}
          />
          <AdminTextField
            label="Footer Brand"
            value={merged.footer.creditBrand}
            onChange={(value) => updateDraft(["footer", "creditBrand"], value)}
          />
          <AdminTextField
            label="Shortcut Lokasi"
            value={merged.shortcuts.events}
            onChange={(value) => updateDraft(["shortcuts", "events"], value)}
          />
          <AdminTextField
            label="Shortcut RSVP"
            value={merged.shortcuts.rsvp}
            onChange={(value) => updateDraft(["shortcuts", "rsvp"], value)}
          />
        </div>
      </fieldset>
      <fieldset className="admin-fieldset">
        <legend>Kredit Pembuat</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="URL Website"
            value={merged.site.creator.websiteUrl ?? ""}
            onChange={(value) => updateDraft(["site", "creator", "websiteUrl"], value)}
          />
          <AdminTextField
            label="URL Profil (fallback)"
            value={merged.site.creator.url}
            onChange={(value) => updateDraft(["site", "creator", "url"], value)}
          />
        </div>
      </fieldset>
    </div>
  );
}
