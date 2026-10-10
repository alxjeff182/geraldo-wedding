import { AdminTextField } from "../AdminFields";
import type { WeddingEvent } from "../../../config/wedding.config";
import type { AdminTabProps } from "../types";

function defaultEventLabel(dateLabel: string, dateShort: string): string {
  const day = dateLabel.split(",")[0]?.trim() || dateLabel;
  return `${day}\n${dateShort}`;
}

function defaultEndsAt(startsAt: string, extraHours = 2): string {
  const match = /^(\d{4}-\d{2}-\d{2}T)(\d{2}):(\d{2}):(\d{2})([+-]\d{2}:\d{2})$/.exec(startsAt);
  if (!match) return startsAt;
  const hour = (Number(match[2]) + extraHours) % 24;
  return `${match[1]}${String(hour).padStart(2, "0")}:${match[3]}:${match[4]}${match[5]}`;
}

function newEventFromWedding(merged: AdminTabProps["merged"]): WeddingEvent {
  const startsAt = merged.date;
  return {
    name: "Acara Baru",
    dateLabel: defaultEventLabel(merged.dateLabel, merged.dateShort),
    time: "08.00 WIB",
    venue: "",
    address: "",
    mapsUrl: "#",
    startsAt,
    endsAt: defaultEndsAt(startsAt),
  };
}

export function AdminAcaraTab({ merged, updateDraft }: AdminTabProps) {
  const events = merged.events;

  const setEvents = (next: WeddingEvent[]) => {
    updateDraft(["events"], next);
  };

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
          <AdminTextField
            label="Tombol Google Calendar"
            value={merged.eventsSection.calendarGoogleButton}
            onChange={(value) => updateDraft(["eventsSection", "calendarGoogleButton"], value)}
          />
          <AdminTextField
            label="Tombol Unduh .ics"
            value={merged.eventsSection.calendarIcsButton}
            onChange={(value) => updateDraft(["eventsSection", "calendarIcsButton"], value)}
          />
          <AdminTextField
            label="Label FAB Kalender (pojok kanan)"
            value={merged.eventsSection.calendarFabLabel}
            onChange={(value) => updateDraft(["eventsSection", "calendarFabLabel"], value)}
          />
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Info Tamu (Dress Code & Tips)</legend>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Tampilkan section</span>
            <select
              className="admin-input"
              value={merged.guestGuide.enabled ? "1" : "0"}
              onChange={(e) => updateDraft(["guestGuide", "enabled"], e.target.value === "1")}
            >
              <option value="1">Ya</option>
              <option value="0">Tidak</option>
            </select>
          </label>
          <AdminTextField
            label="Judul"
            value={merged.guestGuide.title}
            onChange={(value) => updateDraft(["guestGuide", "title"], value)}
          />
          <AdminTextField
            label="Subtitle"
            wide
            value={merged.guestGuide.subtitle}
            onChange={(value) => updateDraft(["guestGuide", "subtitle"], value)}
          />
          <AdminTextField
            label="Judul Dress Code"
            value={merged.guestGuide.dressCodeTitle}
            onChange={(value) => updateDraft(["guestGuide", "dressCodeTitle"], value)}
          />
          <AdminTextField
            label="Isi Dress Code"
            wide
            rows={3}
            value={merged.guestGuide.dressCode}
            onChange={(value) => updateDraft(["guestGuide", "dressCode"], value)}
          />
          <AdminTextField
            label="Judul Tips"
            value={merged.guestGuide.tipsTitle}
            onChange={(value) => updateDraft(["guestGuide", "tipsTitle"], value)}
          />
          <AdminTextField
            label="Isi Tips (baris baru = paragraf)"
            wide
            rows={4}
            value={merged.guestGuide.tips}
            onChange={(value) => updateDraft(["guestGuide", "tips"], value)}
          />
        </div>
      </fieldset>

      {events.map((event, index) => (
        <fieldset key={index} className="admin-fieldset">
          <legend>Acara {index + 1}</legend>
          <div className="admin-form-grid">
            <label className="admin-field admin-field--wide">
              <span className="admin-label">Nama</span>
              <input
                className="admin-input"
                value={event.name}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...next[index], name: e.target.value };
                  setEvents(next);
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
                  const next = [...events];
                  next[index] = { ...next[index], dateLabel: e.target.value };
                  setEvents(next);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Waktu</span>
              <input
                className="admin-input"
                value={event.time}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...next[index], time: e.target.value };
                  setEvents(next);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Mulai (ISO, untuk kalender)</span>
              <input
                className="admin-input"
                value={event.startsAt}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...next[index], startsAt: e.target.value };
                  setEvents(next);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Selesai (ISO, untuk kalender)</span>
              <input
                className="admin-input"
                value={event.endsAt}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...next[index], endsAt: e.target.value };
                  setEvents(next);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Venue</span>
              <input
                className="admin-input"
                value={event.venue}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...next[index], venue: e.target.value };
                  setEvents(next);
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
                  const next = [...events];
                  next[index] = { ...next[index], address: e.target.value };
                  setEvents(next);
                }}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-label">Maps URL</span>
              <input
                className="admin-input"
                value={event.mapsUrl}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...next[index], mapsUrl: e.target.value };
                  setEvents(next);
                }}
              />
            </label>
          </div>
          {events.length > 1 ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--danger admin-btn--sm"
              onClick={() => setEvents(events.filter((_, i) => i !== index))}
            >
              Hapus acara
            </button>
          ) : null}
        </fieldset>
      ))}
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        onClick={() => setEvents([...events, newEventFromWedding(merged)])}
      >
        Tambah acara
      </button>
    </div>
  );
}
