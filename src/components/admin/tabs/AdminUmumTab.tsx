import { AdminOverrideTextField, AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { SiapKirimChecklist } from "../SiapKirimChecklist";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { StoryMilestone } from "../../../config/wedding.config";
import type { AdminTabProps } from "../types";

const emptyMilestone = (): StoryMilestone => ({
  date: "",
  title: "",
  text: "",
  photo: "",
});

export function AdminUmumTab({ merged, defaults, updateDraft, clearDraftPath }: AdminTabProps) {
  const milestones = merged.story.milestones ?? [];

  const setMilestones = (next: StoryMilestone[]) => {
    updateDraft(["story", "milestones"], next);
  };

  const moveMilestone = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= milestones.length) return;
    const next = [...milestones];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setMilestones(next);
  };
  return (
    <div className="admin-form-grid">
      <SiapKirimChecklist merged={merged} />
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
      <AdminOverrideTextField
        label="Intro Mempelai"
        wide
        rows={4}
        value={merged.intro}
        defaultValue={defaults.intro}
        onReset={() => clearDraftPath(["intro"])}
        onChange={(value) => updateDraft(["intro"], value)}
      />
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
      <fieldset className="admin-fieldset admin-field--wide">
        <legend>Our Story (Timeline)</legend>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Tampilkan section</span>
            <select
              className="admin-input"
              value={merged.story.enabled ? "1" : "0"}
              onChange={(e) => updateDraft(["story", "enabled"], e.target.value === "1")}
            >
              <option value="1">Ya</option>
              <option value="0">Tidak</option>
            </select>
          </label>
          <AdminTextField
            label="Judul"
            value={merged.story.title}
            onChange={(value) => updateDraft(["story", "title"], value)}
          />
          <AdminTextField
            label="Subtitle"
            wide
            value={merged.story.subtitle}
            onChange={(value) => updateDraft(["story", "subtitle"], value)}
          />
        </div>
        {milestones.map((item, index) => (
          <fieldset key={index} className="admin-fieldset">
            <legend>Momen {index + 1}</legend>
            <div className="admin-form-grid">
              <AdminTextField
                label="Tanggal / Tahun"
                value={item.date}
                onChange={(value) => {
                  const next = [...milestones];
                  next[index] = { ...next[index], date: value };
                  setMilestones(next);
                }}
              />
              <AdminTextField
                label="Judul momen"
                value={item.title}
                onChange={(value) => {
                  const next = [...milestones];
                  next[index] = { ...next[index], title: value };
                  setMilestones(next);
                }}
              />
              <AdminTextField
                label="Cerita singkat"
                wide
                rows={3}
                value={item.text}
                onChange={(value) => {
                  const next = [...milestones];
                  next[index] = { ...next[index], text: value };
                  setMilestones(next);
                }}
              />
            </div>
            <ImageUploader
              label="Foto (opsional)"
              folder="story"
              spec={MEDIA_SPECS.story}
              value={item.photo ?? ""}
              onChange={(url) => {
                const next = [...milestones];
                next[index] = { ...next[index], photo: url };
                setMilestones(next);
              }}
            />
            <div className="admin-inline-actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                disabled={index === 0}
                onClick={() => moveMilestone(index, -1)}
              >
                Naik
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                disabled={index === milestones.length - 1}
                onClick={() => moveMilestone(index, 1)}
              >
                Turun
              </button>
              {milestones.length > 1 ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--danger admin-btn--sm"
                  onClick={() => setMilestones(milestones.filter((_, i) => i !== index))}
                >
                  Hapus momen
                </button>
              ) : null}
            </div>
          </fieldset>
        ))}
        <div className="admin-inline-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => setMilestones([...milestones, emptyMilestone()])}
          >
            Tambah momen
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => clearDraftPath(["story", "milestones"])}
          >
            Reset ke default
          </button>
        </div>
      </fieldset>
    </div>
  );
}
