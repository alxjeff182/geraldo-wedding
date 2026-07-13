import { AdminTextField } from "../AdminFields";
import type { AdminTabProps } from "../types";

export function AdminAcaraTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-stack">
      <fieldset className="admin-fieldset">
        <legend>Caption Section Acara</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Judul (desktop, pakai enter)"
            wide
            value={merged.eventsSection.title}
            onChange={(value) => updateDraft(["eventsSection", "title"], value)}
            rows={2}
          />
          <AdminTextField
            label="Judul Embedded"
            value={merged.eventsSection.titleEmbedded}
            onChange={(value) => updateDraft(["eventsSection", "titleEmbedded"], value)}
          />
          <AdminTextField
            label="Subtitle"
            wide
            value={merged.eventsSection.subtitle}
            onChange={(value) => updateDraft(["eventsSection", "subtitle"], value)}
          />
          <AdminTextField
            label="Label Venue"
            value={merged.eventsSection.venueLabel}
            onChange={(value) => updateDraft(["eventsSection", "venueLabel"], value)}
          />
          <AdminTextField
            label="Label Venue (dengan titik dua)"
            value={merged.eventsSection.venueLabelColon}
            onChange={(value) => updateDraft(["eventsSection", "venueLabelColon"], value)}
          />
          <AdminTextField
            label="Tombol Maps"
            value={merged.eventsSection.mapsButton}
            onChange={(value) => updateDraft(["eventsSection", "mapsButton"], value)}
          />
        </div>
      </fieldset>
      {merged.events.map((event, index) => (
        <fieldset key={index} className="admin-fieldset">
          <legend>Acara {index + 1}</legend>
          <div className="admin-form-grid">
            <label className="admin-field admin-field--wide">
              <span className="admin-label">Nama</span>
              <input
                className="admin-input"
                value={event.name}
                onChange={(e) => {
                  const events = [...merged.events];
                  events[index] = { ...events[index], name: e.target.value };
                  updateDraft(["events"], events);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Tanggal (baris baru = enter)</span>
              <textarea
                className="admin-input"
                rows={2}
                value={event.dateLabel}
                onChange={(e) => {
                  const events = [...merged.events];
                  events[index] = { ...events[index], dateLabel: e.target.value };
                  updateDraft(["events"], events);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Waktu</span>
              <input
                className="admin-input"
                value={event.time}
                onChange={(e) => {
                  const events = [...merged.events];
                  events[index] = { ...events[index], time: e.target.value };
                  updateDraft(["events"], events);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Venue</span>
              <input
                className="admin-input"
                value={event.venue}
                onChange={(e) => {
                  const events = [...merged.events];
                  events[index] = { ...events[index], venue: e.target.value };
                  updateDraft(["events"], events);
                }}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-label">Alamat</span>
              <textarea
                className="admin-input"
                rows={2}
                value={event.address}
                onChange={(e) => {
                  const events = [...merged.events];
                  events[index] = { ...events[index], address: e.target.value };
                  updateDraft(["events"], events);
                }}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-label">Maps URL</span>
              <input
                className="admin-input"
                value={event.mapsUrl}
                onChange={(e) => {
                  const events = [...merged.events];
                  events[index] = { ...events[index], mapsUrl: e.target.value };
                  updateDraft(["events"], events);
                }}
              />
            </label>
          </div>
        </fieldset>
      ))}
    </div>
  );
}
