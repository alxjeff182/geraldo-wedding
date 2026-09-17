import { useWeddingContent } from "../../context/WeddingContentContext";
import { openCalendarForEvent } from "../../lib/calendar-links";
import type { WeddingEvent } from "../../config/wedding.config";

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 3.5v3.5M16 3.5v3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="7.25" y="12.25" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="10.75" y="12.25" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="14.25" y="12.25" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function pickPrimaryEvent(events: readonly WeddingEvent[]): WeddingEvent | null {
  if (events.length === 0) return null;
  return [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )[0];
}

export function CalendarFab() {
  const { content } = useWeddingContent();
  const event = pickPrimaryEvent(content.events);
  if (!event) return null;

  const calendarEvent = {
    title: `${event.name} — ${content.site.title}`,
    details: `${event.time}\n${event.venue}\n${content.site.url}`,
    location: `${event.venue}, ${event.address}`,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  };

  const label = content.eventsSection.calendarFabLabel;
  const filename = `${event.name.toLowerCase().replace(/\s+/g, "-")}.ics`;

  return (
    <button
      type="button"
      className="calendar-fab"
      aria-label={label}
      title={label}
      onClick={() => {
        openCalendarForEvent(calendarEvent, filename);
      }}
    >
      <CalendarIcon />
    </button>
  );
}
