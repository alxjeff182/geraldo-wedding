import { useWeddingContent } from "../../../context/use-wedding-content";
import type { WeddingEvent } from "../../../config/wedding.config";
import { openCalendarForEvents, type CalendarEventInput } from "../../../lib/calendar-links";
import { IconCalendar } from "../icons";

type Props = {
  eyebrow: string;
  title: string;
  events: WeddingEvent[];
  calendarLabel: string;
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

function formatTimeRange(events: WeddingEvent[]): string {
  if (!events.length) return "";
  const start = new Date(events[0].startsAt);
  const end = new Date(events[events.length - 1].endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const fmt = (d: Date) =>
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
  return `${fmt(start)} – ${fmt(end)} WIB`;
}

export function EventCard({ eyebrow, title, events, calendarLabel }: Props) {
  const { content } = useWeddingContent();
  const saveAllLabel = content.eventsSection.calendarSaveAll || calendarLabel;
  const first = events[0];
  const startDate = first ? new Date(first.startsAt) : null;
  const day = startDate && !Number.isNaN(startDate.getTime()) ? startDate.getDate() : "";
  const month =
    startDate && !Number.isNaN(startDate.getTime())
      ? startDate.toLocaleDateString("id-ID", { month: "long" })
      : "";
  const year = startDate && !Number.isNaN(startDate.getTime()) ? startDate.getFullYear() : "";
  const weekday =
    startDate && !Number.isNaN(startDate.getTime())
      ? startDate.toLocaleDateString("id-ID", { weekday: "long" })
      : "";
  const timeRange = formatTimeRange(events);

  const calendarEvents = events.map((event) => toCalendarInput(event, content.site.title || title));

  const saveAll = () => {
    openCalendarForEvents(calendarEvents, content.site.title || title, "wedding-events.ics");
  };

  return (
    <section id="event" className="event-mod event-mod--calendar" aria-label={title}>
      <div className="event-mod__head">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <article className="cal-card" data-event>
        <div className="cal-card__glow" aria-hidden="true" />
        <div className="cal-card__frame" aria-hidden="true" />
        <p className="cal-card__weekday">
          <span className="cal-card__rule" aria-hidden="true" />
          <span>{weekday}</span>
          <span className="cal-card__rule" aria-hidden="true" />
        </p>
        <p className="cal-card__day">{day}</p>
        <p className="cal-card__month">
          {month} {year}
        </p>
        {timeRange ? <p className="cal-card__time">{timeRange}</p> : null}
        <div className="cal-card__divider" aria-hidden="true" />
        <div className="cal-card__actions">
          <button type="button" className="cal-card__btn" onClick={saveAll}>
            <IconCalendar size={16} />
            <span>{saveAllLabel}</span>
          </button>
        </div>
        <p className="cal-card__note">Detail lokasi & tata acara ada di menu Lokasi</p>
      </article>
    </section>
  );
}
