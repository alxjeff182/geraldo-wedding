import type { WeddingEvent } from "../../../config/wedding.config";
import { buildGoogleCalendarUrl } from "../../../lib/calendar-links";
import { IconPinSm } from "../icons";

type Props = {
  eyebrow: string;
  title: string;
  events: WeddingEvent[];
  mapsLabel: string;
  calendarLabel: string;
};

export function EventCard({
  eyebrow,
  title,
  events,
  mapsLabel,
  calendarLabel,
}: Props) {
  const first = events[0];
  const calUrl = first
    ? buildGoogleCalendarUrl({
        title: `${title} — ${first.name}`,
        details: events.map((e) => `${e.name}: ${e.time}`).join("\n"),
        location: first.address,
        startsAt: first.startsAt,
        endsAt: events[events.length - 1]?.endsAt ?? first.endsAt,
      })
    : null;

  const day = first ? new Date(first.startsAt).getDate() : "";
  const month = first
    ? new Date(first.startsAt).toLocaleDateString("id-ID", { month: "long" })
    : "";
  const year = first ? new Date(first.startsAt).getFullYear() : "";
  const weekday = first
    ? new Date(first.startsAt).toLocaleDateString("id-ID", { weekday: "long" })
    : "";

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
            </li>
          ))}
        </ol>
        <div className="event-card__divider" aria-hidden="true" />
        <div className="event-card__venue">
          <span className="event-card__icon" aria-hidden="true">
            <IconPinSm />
          </span>
          <div>
            <strong>{first?.venue}</strong>
            <small>{first?.address}</small>
          </div>
        </div>
        <div className="event-card__actions">
          {first?.mapsUrl ? (
            <a
              className="event-card__btn"
              href={first.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {mapsLabel}
            </a>
          ) : null}
          {calUrl ? (
            <a
              className="event-card__btn event-card__btn--ghost"
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {calendarLabel}
            </a>
          ) : null}
        </div>
      </article>
    </section>
  );
}
