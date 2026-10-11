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
        <legend>Tombol Acara</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Tombol Google Calendar"
            value={merged.eventsSection.calendarGoogleButton}
            onChange={(value) => updateDraft(["eventsSection", "calendarGoogleButton"], value)}
          />
          <AdminTextField
            label="Tombol Buka Maps (sheet)"
            value={merged.eventsSection.sheetMapsButton ?? "Buka Maps"}
            onChange={(value) => updateDraft(["eventsSection", "sheetMapsButton"], value)}
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
