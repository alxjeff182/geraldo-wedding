import type { WeddingEvent } from "../../../config/wedding.config";
import {
  buildIcsCalendar,
  downloadIcsFile,
  openCalendarForEvents,
  type CalendarEventInput,
} from "../../../lib/calendar-links";
import { IconPinSm } from "../icons";

type Props = {
  eyebrow: string;
  title: string;
  events: WeddingEvent[];
  mapsLabel: string;
  calendarLabel: string;
  calendarIcsLabel?: string;
};

function toCalendarInput(event: WeddingEvent, siteTitle: string): CalendarEventInput {
  return {
    title: `${siteTitle} — ${event.name}`,
    details: `${event.name}\n${event.time}\n${event.venue}`,
    location: event.address,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  };
}

export function EventCard({
  eyebrow,
  title,
  events,
  mapsLabel,
  calendarLabel,
  calendarIcsLabel = "Unduh .ics",
}: Props) {
  const first = events[0];
  const day = first ? new Date(first.startsAt).getDate() : "";
  const month = first
    ? new Date(first.startsAt).toLocaleDateString("id-ID", { month: "long" })
    : "";
  const year = first ? new Date(first.startsAt).getFullYear() : "";
  const weekday = first
    ? new Date(first.startsAt).toLocaleDateString("id-ID", { weekday: "long" })
    : "";

  const calendarEvents = events.map((event) => toCalendarInput(event, title));

  const saveAll = () => {
    openCalendarForEvents(calendarEvents, title, "wedding-events.ics");
  };

  const downloadIcs = () => {
    const ics = buildIcsCalendar(calendarEvents, title);
    if (ics) downloadIcsFile("wedding-events.ics", ics);
  };

  return (
    <section id="event" className="event-mod" aria-label={title}>
      <div className="event-mod__head">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <article className="event-card" data-event>
        <div className="event-card__glow" aria-hidden="true" />
        <div className="event-card__date">
          <span className="event-card__day">{day}</span>
          <span className="event-card__rule" aria-hidden="true" />
          <span className="event-card__meta">
            <small>{weekday}</small>
            <strong>{month}</strong>
            <span>{year}</span>
          </span>
        </div>
        <div className="event-card__divider" aria-hidden="true" />
        <ol className="event-timeline">
          {events.map((event) => (
            <li key={event.name} className="event-timeline__item">
              <p className="event-timeline__time">{event.time}</p>
              <p className="event-timeline__name">{event.name}</p>
              <p className="event-timeline__note">{event.venue}</p>
              <div className="event-card__venue event-card__venue--inline">
                <span className="event-card__icon" aria-hidden="true">
                  <IconPinSm />
                </span>
                <div>
                  <strong>{event.venue}</strong>
                  <small>{event.address}</small>
                </div>
              </div>
              <div className="event-card__actions event-card__actions--inline">
                {event.mapsUrl ? (
                  <a
                    className="event-card__btn"
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {mapsLabel}
                  </a>
                ) : null}
                <button
                  type="button"
                  className="event-card__btn event-card__btn--ghost"
                  onClick={() =>
                    openCalendarForEvents(
                      [toCalendarInput(event, title)],
                      `${title} — ${event.name}`,
                      `${event.name.toLowerCase().replace(/\s+/g, "-")}.ics`,
                    )
                  }
                >
                  {calendarLabel}
                </button>
              </div>
            </li>
          ))}
        </ol>
        <div className="event-card__divider" aria-hidden="true" />
        <div className="event-card__actions">
          <button type="button" className="event-card__btn" onClick={saveAll}>
            Simpan ke Kalender
          </button>
          <button
            type="button"
            className="event-card__btn event-card__btn--ghost"
            onClick={downloadIcs}
          >
            {calendarIcsLabel}
          </button>
        </div>
      </article>
    </section>
  );
}
