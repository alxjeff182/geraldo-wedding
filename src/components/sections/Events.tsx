import { motion } from "framer-motion";
import { useWeddingContent } from "../../context/WeddingContentContext";
import type { WeddingEvent } from "../../config/wedding.config";
import { OPEN_EASE } from "../../constants/open-animation";
import { LocationIcon } from "../ui/LocationIcon";
import { PinDropIcon } from "../ui/PinDropIcon";

type Props = {
  embedded?: boolean;
};

const EMBED_SPRING = { type: "spring" as const, stiffness: 380, damping: 26 };

function EmbeddedEventItem({
  event,
  index,
  showDivider,
}: {
  event: WeddingEvent;
  index: number;
  showDivider: boolean;
}) {
  const { content } = useWeddingContent();
  const [dayLine, dateLine] = event.dateLabel.split("\n");
  const enterDelay = 0.14 + index * 0.13;

  return (
    <>
      <motion.article
        className="events-item events-item--embedded"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: enterDelay, duration: 0.45, ease: OPEN_EASE }}
        whileHover={{ scale: 1.01 }}
      >
        <motion.div
          className="events-item__pin events-item__pin--embedded"
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: enterDelay + 0.06, ...EMBED_SPRING }}
        >
          <motion.span
            className="events-item__pin-bounce"
            animate={{ y: [0, 3, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: "easeInOut",
              delay: 0.8 + index * 0.4,
            }}
          >
            <PinDropIcon />
          </motion.span>
        </motion.div>

        <p className="events-item__name">{event.name}</p>

        <div className="events-item__meta">
          <span className="events-meta-chip">{dayLine}</span>
          <span className="events-meta-chip events-meta-chip--gold">{dateLine}</span>
          <span className="events-meta-chip">{event.time}</span>
        </div>

        <div className="events-item__venue events-item__venue--embedded">
          <p className="events-venue-label">{content.eventsSection.venueLabel}</p>
          <p>
            <strong>{event.venue}</strong>
          </p>
          <p>{event.address}</p>
        </div>

        <motion.a
          href={event.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold btn-gold--compact btn-gold--interactive"
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={EMBED_SPRING}
        >
          <span className="btn-gold__shine" aria-hidden />
          <LocationIcon />
          {content.eventsSection.mapsButton}
        </motion.a>
      </motion.article>

      {showDivider && (
        <motion.img
          src={content.media.divider}
          alt=""
          className="divider-img events-divider events-divider--embedded"
          loading="lazy"
          width={320}
          height={74}
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 0.92, scaleX: 1 }}
          transition={{ delay: enterDelay + 0.1, duration: 0.5, ease: OPEN_EASE }}
        />
      )}
    </>
  );
}

export function Events({ embedded = false }: Props) {
  const { content } = useWeddingContent();
  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      {...(!embedded ? { id: "events" } : {})}
      className={`section-events-wrap${embedded ? " section-events-wrap--embedded" : ""}`}
      aria-labelledby="events-heading"
    >
      <motion.div
        className={`events-card${embedded ? " events-card--embedded" : ""}`}
        {...(embedded
          ? {
              initial: { opacity: 0, scale: 0.97 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.42, ease: OPEN_EASE },
            }
          : {})}
      >
        <motion.div
          className={embedded ? "events-embedded-intro" : undefined}
          {...(embedded
            ? {
                initial: { opacity: 0, y: -12 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.06, duration: 0.4, ease: OPEN_EASE },
              }
            : {})}
        >
          <p className="events-title">
            {embedded ? (
              content.eventsSection.titleEmbedded
            ) : (
              <>
                {content.eventsSection.title.split("\n").map((line, index, lines) => (
                  <span key={line}>
                    {line}
                    {index < lines.length - 1 && <br />}
                  </span>
                ))}
              </>
            )}
          </p>
          <p id="events-heading" className="events-subtitle">
            {content.eventsSection.subtitle}
          </p>
        </motion.div>

        <div className={embedded ? "events-list events-list--embedded" : "mt-2"}>
          {content.events.map((event, index) =>
            embedded ? (
              <EmbeddedEventItem
                key={event.name}
                event={event}
                index={index}
                showDivider={index < content.events.length - 1}
              />
            ) : (
              <motion.article
                key={event.name}
                className="events-item"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="events-item__name">{event.name}</p>
                <p className="events-item__date whitespace-pre-line">{event.dateLabel}</p>
                <p className="events-item__time">{event.time}</p>

                <div className="events-item__pin" aria-hidden>
                  <PinDropIcon />
                </div>

                <div className="events-item__venue">
                  <p>{content.eventsSection.venueLabelColon}</p>
                  <p>
                    <strong>{event.venue}</strong>
                  </p>
                  <p>{event.address}</p>
                </div>

                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold mt-5"
                >
                  <LocationIcon />
                  {content.eventsSection.mapsButton}
                </a>

                {index < content.events.length - 1 && (
                  <img
                    src={content.media.divider}
                    alt=""
                    className="divider-img events-divider mt-8"
                    loading="lazy"
                    width={320}
                    height={74}
                  />
                )}
              </motion.article>
            ),
          )}
        </div>
      </motion.div>
    </Wrapper>
  );
}
