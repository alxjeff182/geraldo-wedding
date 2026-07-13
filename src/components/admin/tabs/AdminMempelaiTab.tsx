import { AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminMempelaiTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-stack">
      <fieldset className="admin-fieldset">
        <legend>Caption Section Mempelai</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Prefix"
            value={merged.coupleSection.prefix}
            onChange={(value) => updateDraft(["coupleSection", "prefix"], value)}
          />
          <AdminTextField
            label="Judul Section"
            value={merged.coupleSection.title}
            onChange={(value) => updateDraft(["coupleSection", "title"], value)}
          />
          <AdminTextField
            label="Konektor"
            value={merged.coupleSection.connector}
            onChange={(value) => updateDraft(["coupleSection", "connector"], value)}
          />
        </div>
      </fieldset>
      {(["groom", "bride"] as const).map((role) => (
        <fieldset key={role} className="admin-fieldset">
          <legend>{role === "groom" ? "Mempelai Pria" : "Mempelai Wanita"}</legend>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span className="admin-label">Nama Pendek</span>
              <input
                className="admin-input"
                value={merged.couple[role].shortName}
                onChange={(e) => updateDraft(["couple", role, "shortName"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Nama Lengkap</span>
              <input
                className="admin-input"
                value={merged.couple[role].fullName}
                onChange={(e) => updateDraft(["couple", role, "fullName"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Instagram URL</span>
              <input
                className="admin-input"
                value={merged.couple[role].instagram}
                onChange={(e) => updateDraft(["couple", role, "instagram"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Instagram Handle</span>
              <input
                className="admin-input"
                value={merged.couple[role].instagramHandle}
                onChange={(e) => updateDraft(["couple", role, "instagramHandle"], e.target.value)}
              />
            </label>
          </div>
          <ImageUploader
            label="Foto"
            folder={`couple/${role}`}
            spec={MEDIA_SPECS.couplePhoto}
            value={merged.couple[role].photo}
            onChange={(url) => updateDraft(["couple", role, "photo"], url)}
          />
        </fieldset>
      ))}
      <fieldset className="admin-fieldset">
        <legend>Hero Caption</legend>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Nama Pria (hero)</span>
            <input
              className="admin-input"
              value={merged.hero.groomName}
              onChange={(e) => updateDraft(["hero", "groomName"], e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span className="admin-label">Nama Wanita (hero)</span>
            <input
              className="admin-input"
              value={merged.hero.brideName}
              onChange={(e) => updateDraft(["hero", "brideName"], e.target.value)}
            />
          </label>
        </div>
      </fieldset>
    </div>
  );
}
