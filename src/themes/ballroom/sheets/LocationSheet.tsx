import { useEffect, useState } from "react";
import type { WeddingEvent } from "../../../config/wedding.config";
import { buildGoogleCalendarUrl } from "../../../lib/calendar-links";
import { IconCopy, IconPin, IconPinSm } from "../icons";

type Props = {
  open: boolean;
  events: WeddingEvent[];
  mapsLabel: string;
  calendarLabel: string;
  onClose: () => void;
  setSheetRef: (el: HTMLElement | null) => void;
  onToast: (msg: string) => void;
};

export function LocationSheet({
  open,
  events,
  mapsLabel,
  calendarLabel,
  onClose,
  setSheetRef,
  onToast,
}: Props) {
  const [tab, setTab] = useState(0);
  const event = events[tab] ?? events[0];
  const sameVenue =
    events.length > 0 && events.every((item) => item.venue === events[0]?.venue);

  useEffect(() => {
    if (open) setTab(0);
  }, [open]);

  const embedSrc = event
    ? `https://maps.google.com/maps?q=${encodeURIComponent(event.address || event.venue)}&z=15&output=embed`
    : "";

  const calUrl = event
    ? buildGoogleCalendarUrl({
        title: event.name,
        details: `${event.time}\n${event.venue}`,
        location: event.address,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
      })
    : null;

  const copyAddress = async () => {
    if (!event) return;
    try {
      await navigator.clipboard.writeText(event.address);
      onToast("Alamat tersalin");
    } catch {
      onToast("Gagal menyalin");
    }
  };

  return (
    <section
      ref={setSheetRef}
      className={`sheet${open ? " is-open" : ""}`}
      id="sheet-location"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheetLocTitle"
      tabIndex={-1}
      hidden={!open}
    >
      <div className="sheet__handle" aria-hidden="true" />
      <button type="button" className="sheet__close" aria-label="Tutup" onClick={onClose}>
        ×
      </button>
      <header className="sheet__head">
        <span className="sheet__badge" aria-hidden="true">
          <IconPin size={18} />
        </span>
        <p className="eyebrow">Tempat Acara</p>
        <h3 id="sheetLocTitle">Lokasi</h3>
        <p className="sheet__sub">
          {sameVenue
            ? "Satu venue untuk pemberkatan dan resepsi"
            : "Pilih venue untuk melihat peta"}
        </p>
      </header>
      <div className="sheet__body">
        {events.length > 1 && !sameVenue ? (
          <div className="seg" role="tablist" aria-label="Venue">
            {events.map((item, i) => (
              <button
                key={item.name}
                type="button"
                className={`seg__btn${tab === i ? " is-active" : ""}`}
                role="tab"
                aria-selected={tab === i}
                onClick={() => setTab(i)}
              >
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
        {event ? (
          <>
            <div className="sheet__map">
              <iframe
                title={`Peta ${event.venue}`}
                src={embedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="sheet__map-fade" aria-hidden="true" />
              <span className="sheet__map-chip">{event.venue}</span>
            </div>
            <div className="sheet-venue-card">
              <span className="sheet-venue-card__icon" aria-hidden="true">
                <IconPinSm />
              </span>
              <div className="sheet-venue-card__text">
                <h4>{event.venue}</h4>
                <p>{event.address}</p>
              </div>
              <button
                type="button"
                className="sheet-venue-card__copy"
                aria-label="Salin alamat"
                onClick={() => void copyAddress()}
              >
                <IconCopy />
              </button>
            </div>
            <ol className="sheet-timeline">
              {events.map((item) => (
                <li key={item.name}>
                  <span className="sheet-timeline__name">{item.name}</span>
                  <strong className="num">{item.time}</strong>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </div>
      <footer className="sheet__foot sheet__foot--row">
        {event ? (
          <a className="btn sheet__cta" href={event.mapsUrl} target="_blank" rel="noopener noreferrer">
            {mapsLabel}
          </a>
        ) : null}
        {calUrl ? (
          <a className="btn btn--ghost sheet__cta" href={calUrl} target="_blank" rel="noopener noreferrer">
            {calendarLabel}
          </a>
        ) : null}
      </footer>
    </section>
  );
}
