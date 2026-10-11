import { useRef, useState, type RefObject } from "react";
import type { StoryMilestone } from "../../../config/wedding.config";
import { MediaImage } from "../../../components/MediaImage";
import { useStoryTimeline } from "../hooks/useStoryTimeline";

type Props = {
  subtitle: string;
  title: string;
  milestones: StoryMilestone[];
  scrollRootRef?: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

function MilestoneHeart({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 20.4S4.5 15.3 4.5 9.9A4.35 4.35 0 0 1 12 6.6a4.35 4.35 0 0 1 7.5 3.3c0 5.4-7.5 10.5-7.5 10.5z" />
    </svg>
  );
}

export function StorySection({
  subtitle,
  title,
  milestones,
  scrollRootRef,
  enabled = true,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useStoryTimeline({
    sectionRef,
    scrollRootRef,
    enabled,
    count: milestones.length,
  });

  if (!milestones.length) return null;

  return (
    <section
      id="story"
      ref={sectionRef}
      className="section story-mod fade-up"
      aria-label={title}
      style={{ ["--fill" as string]: "0" }}
    >
      <div className="section__head">
        <p className="eyebrow">{subtitle}</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>

      <div className="story-tl">
        <div className="story-tl__track" aria-hidden="true">
          <span className="story-tl__rail" />
          <span className="story-tl__fill" />
        </div>
        <ol className="story-tl__list">
          {milestones.map((item, index) => {
            const isLast = index === milestones.length - 1;
            const hasPhoto = Boolean(item.photo?.trim());
            const isExpanded = expanded === index;

            return (
              <li key={`${item.date}-${item.title}-${index}`} className="story-tl__item">
                <span
                  className={`story-tl__node${isLast ? " story-tl__node--heart" : ""}`}
                  aria-hidden="true"
                >
                  {isLast ? <MilestoneHeart size={11} /> : null}
                </span>
                <div className="story-tl__body">
                  {item.date ? <p className="story-tl__date">{item.date}</p> : null}
                  {item.title ? <h4 className="story-tl__title">{item.title}</h4> : null}
                  {item.text ? <p className="story-tl__text">{item.text}</p> : null}
                  {hasPhoto ? (
                    <button
                      type="button"
                      className={`story-tl__photo${isExpanded ? " is-expanded" : ""}`}
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Tutup foto ${item.title || "momen"}`
                          : `Perbesar foto ${item.title || "momen"}`
                      }
                      onClick={() => setExpanded(isExpanded ? null : index)}
                    >
                      <MediaImage
                        src={item.photo!.trim()}
                        alt={item.title || item.date || "Momen cerita"}
                        width={800}
                        height={800}
                        loading="lazy"
                      />
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
