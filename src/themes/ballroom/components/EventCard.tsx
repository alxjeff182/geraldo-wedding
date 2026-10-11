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

const DISPLAY_TIME = "08:00 - Selesai";

function buildWeddingCalendarEvent(
  events: WeddingEvent[],
  calendarTitle: string,
): CalendarEventInput | null {
  if (!events.length) return null;
  const first = events[0];
  const last = events[events.length - 1];
  const details = events
    .map((event) => `• ${event.name} — ${event.time}\n  ${event.venue}`)
    .join("\n");
  return {
    title: calendarTitle,
    details,
    location: first.address || first.venue,
    startsAt: first.startsAt,
    endsAt: last.endsAt,
  };
}

export function EventCard({ eyebrow, title, events, calendarLabel }: Props) {
  const { content } = useWeddingContent();
  const saveAllLabel = content.eventsSection.calendarSaveAll || calendarLabel;
  const calendarTitle = `${content.hero.eyebrow} ${content.site.title}`.replace(/\s+/g, " ").trim();
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

  const saveAll = () => {
    const event = buildWeddingCalendarEvent(events, calendarTitle);
    if (!event) return;
    openCalendarForEvents([event], calendarTitle, "wedding-events.ics");
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
        <p className="cal-card__time">{DISPLAY_TIME}</p>
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
