import { useWeddingContent } from "../../context/WeddingContentContext";
import { openCalendarForEvents, prefersAppleCalendar } from "../../lib/calendar-links";
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

export function CalendarFab() {
  const { content } = useWeddingContent();
  if (content.events.length === 0) return null;

  const sorted = [...content.events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  const calendarEvents = sorted.map((event: WeddingEvent) => ({
    title: `${event.name} - ${content.site.title}`,
    details: [
      `Pernikahan ${content.site.title}`,
      event.time,
      event.venue,
      event.address,
      content.site.url,
    ]
      .filter(Boolean)
      .join("\n"),
    location: `${event.venue}, ${event.address}`,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  }));

  const calendarName = `Pernikahan ${content.site.title}`;
  const label = prefersAppleCalendar()
    ? "Tambah ke Kalender"
    : content.eventsSection.calendarFabLabel || "Tambah ke Google Calendar";

  return (
    <button
      type="button"
      className="invite-fab invite-fab--calendar"
      aria-label={label}
      title={label}
      onClick={() => {
        openCalendarForEvents(calendarEvents, calendarName, "pernikahan-geraldo-christin.ics");
      }}
    >
      <CalendarIcon />
    </button>
  );
}
