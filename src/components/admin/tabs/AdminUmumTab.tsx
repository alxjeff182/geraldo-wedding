import { AdminTextField } from "../AdminFields";
import type { AdminTabProps } from "../types";

export function AdminUmumTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-form-grid">
      <label className="admin-field">
        <span className="admin-label">Judul Situs</span>
        <input
          className="admin-input"
          value={merged.site.title}
          onChange={(e) => updateDraft(["site", "title"], e.target.value)}
        />
      </label>
      <label className="admin-field admin-field--wide">
        <span className="admin-label">Deskripsi SEO</span>
        <textarea
          className="admin-input"
          rows={3}
          value={merged.site.description}
          onChange={(e) => updateDraft(["site", "description"], e.target.value)}
        />
      </label>
      <label className="admin-field">
        <span className="admin-label">Tanggal (ISO)</span>
        <input
          className="admin-input"
          value={merged.date}
          onChange={(e) => updateDraft(["date"], e.target.value)}
        />
      </label>
      <label className="admin-field">
        <span className="admin-label">Label Tanggal</span>
        <input
          className="admin-input"
          value={merged.dateLabel}
          onChange={(e) => updateDraft(["dateLabel"], e.target.value)}
        />
      </label>
      <label className="admin-field admin-field--wide">
        <span className="admin-label">Intro Mempelai</span>
        <textarea
          className="admin-input"
          rows={4}
          value={merged.intro}
          onChange={(e) => updateDraft(["intro"], e.target.value)}
        />
      </label>
      <AdminTextField
        label="Hero Eyebrow"
        value={merged.hero.eyebrow}
        onChange={(value) => updateDraft(["hero", "eyebrow"], value)}
      />
      <fieldset className="admin-fieldset admin-field--wide">
        <legend>Sampul Undangan</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Eyebrow"
            value={merged.cover.eyebrow}
            onChange={(value) => updateDraft(["cover", "eyebrow"], value)}
          />
          <AdminTextField
            label="Salam"
            value={merged.cover.salutation}
            onChange={(value) => updateDraft(["cover", "salutation"], value)}
          />
          <AdminTextField
            label="Tombol Buka"
            value={merged.cover.openButton}
            onChange={(value) => updateDraft(["cover", "openButton"], value)}
          />
          <AdminTextField
            label="Aria Label Tombol"
            value={merged.cover.openButtonAriaLabel}
            onChange={(value) => updateDraft(["cover", "openButtonAriaLabel"], value)}
          />
        </div>
      </fieldset>
      <fieldset className="admin-fieldset admin-field--wide">
        <legend>Countdown</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Judul"
            value={merged.countdown.title}
            onChange={(value) => updateDraft(["countdown", "title"], value)}
          />
          <AdminTextField
            label="Heading (sr-only)"
            value={merged.countdown.heading}
            onChange={(value) => updateDraft(["countdown", "heading"], value)}
          />
          <AdminTextField
            label="Label Days"
            value={merged.countdown.labels.days}
            onChange={(value) => updateDraft(["countdown", "labels", "days"], value)}
          />
          <AdminTextField
            label="Label Hours"
            value={merged.countdown.labels.hours}
            onChange={(value) => updateDraft(["countdown", "labels", "hours"], value)}
          />
          <AdminTextField
            label="Label Minutes"
            value={merged.countdown.labels.minutes}
            onChange={(value) => updateDraft(["countdown", "labels", "minutes"], value)}
          />
          <AdminTextField
            label="Label Seconds"
            value={merged.countdown.labels.seconds}
            onChange={(value) => updateDraft(["countdown", "labels", "seconds"], value)}
          />
        </div>
      </fieldset>
    </div>
  );
}
