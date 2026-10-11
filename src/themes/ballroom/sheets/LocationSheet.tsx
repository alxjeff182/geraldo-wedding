import { useEffect, useState } from "react";
import type { WeddingEvent } from "../../../config/wedding.config";
import { openMaps } from "../../../lib/maps-links";
import { IconCopy, IconPin, IconPinSm } from "../icons";

type Props = {
  open: boolean;
  events: WeddingEvent[];
  mapsLabel: string;
  onClose: () => void;
  setSheetRef: (el: HTMLElement | null) => void;
  onToast: (msg: string) => void;
};

export function LocationSheet({ open, events, mapsLabel, onClose, setSheetRef, onToast }: Props) {
  const [tab, setTab] = useState(0);
  const event = events[tab] ?? events[0];
  const sameVenue = events.length > 0 && events.every((item) => item.venue === events[0]?.venue);

  useEffect(() => {
    if (open) setTab(0);
  }, [open]);

  // Keyless embeds drop any name paired with raw coordinates; cid renders the real place card.
  const embedSrc = event
    ? event.mapsCid
      ? `https://maps.google.com/maps?cid=${event.mapsCid}&z=16&output=embed`
      : hasCoords(event)
        ? `https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&ll=${event.lat},${event.lng}&z=16&output=embed`
        : `https://maps.google.com/maps?q=${encodeURIComponent(event.address || event.venue)}&z=15&output=embed`
    : "";

  const copyAddress = async () => {
    if (!event) return;
    try {
      await navigator.clipboard.writeText(event.address);
      onToast("Alamat tersalin");
    } catch {
      onToast("Gagal menyalin");
    }
  };

  const openEventMaps = () => {
    if (!event?.mapsUrl) return;
    openMaps({
      mapsUrl: event.mapsUrl,
      address: event.address,
      venue: event.venue,
      lat: event.lat,
      lng: event.lng,
    });
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
        <p className="eyebrow">Lokasi</p>
        <h3 id="sheetLocTitle">Tempat Acara</h3>
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
            <div className="sheet-timeline-block">
              <p className="sheet-timeline-block__label">Tata Acara</p>
              <ol className="sheet-timeline">
                {events.map((item) => (
                  <li key={item.name}>
                    <span className="sheet-timeline__name">{item.name}</span>
                    <strong className="num">{item.time}</strong>
                  </li>
                ))}
              </ol>
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
          </>
        ) : null}
      </div>
      <footer className="sheet__foot">
        {event?.mapsUrl ? (
          <button type="button" className="btn sheet__cta" onClick={openEventMaps}>
            {mapsLabel}
          </button>
        ) : null}
      </footer>
    </section>
  );
}

function hasCoords(event: WeddingEvent): event is WeddingEvent & { lat: number; lng: number } {
  return (
    typeof event.lat === "number" &&
    typeof event.lng === "number" &&
    Number.isFinite(event.lat) &&
    Number.isFinite(event.lng)
  );
}
