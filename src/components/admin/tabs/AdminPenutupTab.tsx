import { AdminParagraphListField, AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminPenutupTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-stack">
      <fieldset className="admin-fieldset">
        <legend>Ayat & Penutup</legend>
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
        <AdminParagraphListField
          label="Paragraf Penutup (pisah baris kosong)"
          value={merged.closing.paragraphs}
          onChange={(value) => updateDraft(["closing", "paragraphs"], value)}
        />
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
        </div>
        <ImageUploader
          label="Foto Hashtag"
          folder="hashtag"
          spec={MEDIA_SPECS.hashtagPhoto}
          value={merged.hashtag.photo}
          onChange={(url) => updateDraft(["hashtag", "photo"], url)}
        />
      </fieldset>
      <fieldset className="admin-fieldset">
        <legend>Footer & Shortcut Hero</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Footer Prefix"
            value={merged.footer.creditPrefix}
            onChange={(value) => updateDraft(["footer", "creditPrefix"], value)}
          />
          <AdminTextField
            label="Footer Prompt"
            value={merged.footer.portfolioPrompt}
            onChange={(value) => updateDraft(["footer", "portfolioPrompt"], value)}
          />
          <AdminTextField
            label="Shortcut Waktu"
            value={merged.shortcuts.countdown}
            onChange={(value) => updateDraft(["shortcuts", "countdown"], value)}
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
            label="Nama"
            value={merged.site.creator.name}
            onChange={(value) => updateDraft(["site", "creator", "name"], value)}
          />
          <AdminTextField
            label="URL Profil"
            value={merged.site.creator.url}
            onChange={(value) => updateDraft(["site", "creator", "url"], value)}
          />
          <AdminTextField
            label="URL Website"
            value={merged.site.creator.websiteUrl ?? ""}
            onChange={(value) => updateDraft(["site", "creator", "websiteUrl"], value)}
          />
          <AdminTextField
            label="URL Instagram"
            value={merged.site.creator.instagramUrl ?? ""}
            onChange={(value) => updateDraft(["site", "creator", "instagramUrl"], value)}
          />
        </div>
      </fieldset>
    </div>
  );
}
