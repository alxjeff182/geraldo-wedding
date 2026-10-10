import { useEffect, useRef, useState, type RefObject } from "react";

type Person = {
  role: string;
  name: string;
  fullName?: string;
  parents: string;
  photo: string;
  instagramHandle?: string;
};

function igHref(handle?: string): string | null {
  if (!handle?.trim()) return null;
  const clean = handle.replace(/^@/, "").trim();
  if (!clean) return null;
  return `https://www.instagram.com/${clean}/`;
}

type Props = {
  scrollRootRef: RefObject<HTMLElement | null>;
  eyebrow: string;
  title: string;
  groom: Person;
  bride: Person;
  enabled?: boolean;
};

/** Split "Putra dari A. Tampubolon / br. Situmorang" into GW5 markup parts. */
function ParentsLine({ text }: { text: string }) {
  const match = text.match(/^(.*?dari)\s+(.+?)\s*\/\s*(.+)$/i);
  if (!match) {
    return <p className="couple-card__parents">{text}</p>;
  }
  const [, prefix, left, right] = match;
  return (
    <p className="couple-card__parents">
      <span>{prefix.trim()}</span> {left.trim()} <i>/</i> {right.trim()}
    </p>
  );
}

export function CoupleStory({
  scrollRootRef,
  eyebrow,
  title,
  groom,
  bride,
  enabled = true,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deep, setDeep] = useState(false);
  const people = [groom, bride];

  useEffect(() => {
    if (!enabled) return;
    const invitation = scrollRootRef.current;
    const story = sectionRef.current;
    if (!invitation || !story) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
    const CHAPTERS = cards.length || 2;
    let storyTicking = false;
    let current = 0;

    const apply3D = (angle: number) => {
      cards.forEach((card, i) => {
        const offset = i - angle;
        const abs = Math.abs(offset);
        const rotateY = offset * -52;
        const translateX = offset * 42;
        const translateZ = -abs * 160;
        const scale = Math.max(0.78, 1 - abs * 0.12);
        const opacity = Math.max(0, 1 - abs * 0.55);
        const blur = Math.min(2.5, abs * 1.2);

        card.style.transform =
          `translate(-50%, -50%) translateX(${translateX}%) ` +
          `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`;
        card.style.opacity = String(opacity);
        card.style.filter =
          abs < 0.15
            ? "drop-shadow(0 24px 40px rgba(0,0,0,0.55))"
            : `brightness(${Math.max(0.65, 1 - abs * 0.28)}) blur(${blur}px)`;
        card.style.zIndex = String(Math.round(10 - abs * 4));
        card.style.pointerEvents = abs < 0.45 ? "auto" : "none";
        card.classList.toggle("is-active", abs < 0.45);

        if (abs >= 0.45) card.classList.remove("is-flipped");
      });
    };

    const syncStory = () => {
      const viewH = invitation.clientHeight || 1;
      const top = story.offsetTop;
      const maxScroll = Math.max(1, story.offsetHeight - viewH);
      const local = invitation.scrollTop - top;
      const progress = Math.min(1, Math.max(0, local / maxScroll));
      const angle = progress * (CHAPTERS - 1);
      const index = Math.min(CHAPTERS - 1, Math.max(0, Math.round(angle)));

      if (local > -viewH * 0.25 && local < maxScroll + viewH * 0.25) {
        apply3D(angle);
        if (index !== current) {
          current = index;
          setActiveIndex(index);
        }
      }

      const isDeep = progress > 0.1;
      story.classList.toggle("is-deep", isDeep);
      setDeep(isDeep);
    };

    const flipCard = (card: HTMLElement) => {
      if (!card.classList.contains("is-active")) return;
      card.classList.toggle("is-flipped");
    };

    const onCardClick = (e: Event) => {
      flipCard(e.currentTarget as HTMLElement);
    };

    const onCardKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      flipCard(e.currentTarget as HTMLElement);
    };

    cards.forEach((card) => {
      card.addEventListener("click", onCardClick);
      card.addEventListener("keydown", onCardKeyDown);
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
    });

    const onScroll = () => {
      if (storyTicking) return;
      storyTicking = true;
      requestAnimationFrame(() => {
        syncStory();
        storyTicking = false;
      });
    };

    invitation.addEventListener("scroll", onScroll, { passive: true });
    apply3D(0);
    syncStory();

    return () => {
      invitation.removeEventListener("scroll", onScroll);
      cards.forEach((card) => {
        card.removeEventListener("click", onCardClick);
        card.removeEventListener("keydown", onCardKeyDown);
      });
    };
  }, [scrollRootRef, enabled, people.length]);

  const scrollToChapter = (i: number) => {
    const invitation = scrollRootRef.current;
    const story = sectionRef.current;
    if (!invitation || !story) return;
    const viewH = invitation.clientHeight || 1;
    const maxScroll = Math.max(1, story.offsetHeight - viewH);
    const target = story.offsetTop + (i / Math.max(1, people.length - 1)) * maxScroll;
    invitation.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      id="couple"
      ref={sectionRef}
      className={`couple-story${deep ? " is-deep" : ""}`}
      aria-label={title}
    >
      <div className="couple-story__pin">
        <div className="couple-story__bg" aria-hidden="true">
          <img src="/assets/ballroom/couple/bg.jpg" alt="" width={1080} height={1350} />
        </div>
        <div className="couple-story__veil" aria-hidden="true" />
        <div className="couple-story__head">
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <div className="couple-story__progress" aria-hidden="true">
          {people.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`couple-story__dot${i === activeIndex ? " is-active" : ""}`}
              data-dot={i}
              aria-label={`Bab ${i + 1}`}
              onClick={() => scrollToChapter(i)}
            />
          ))}
        </div>
        <div className="couple-story__scene">
          <div className="couple-story__carousel">
            {people.map((person, i) => (
              <div
                key={person.name}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className={`couple-card${i === activeIndex ? " is-active" : ""}`}
                data-chapter={i}
              >
                <div className="couple-card__inner">
                  <div className="couple-card__face couple-card__face--front">
                    <img src={person.photo} alt={person.name} width={720} height={1280} />
                    <div className="couple-card__caption">
                      <p className="couple-card__role">{person.role}</p>
                      <h4>{person.name}</h4>
                      <ParentsLine text={person.parents} />
                    </div>
                  </div>
                  <div className="couple-card__face couple-card__face--back">
                    <p className="couple-card__role">{person.role}</p>
                    <h4>{person.fullName?.trim() || person.name}</h4>
                    <ParentsLine text={person.parents} />
                    {igHref(person.instagramHandle) ? (
                      <a
                        className="couple-card__ig"
                        href={igHref(person.instagramHandle)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {person.instagramHandle}
                      </a>
                    ) : null}
                    <p className="couple-card__tap">Ketuk untuk kembali</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="couple-story__hint" aria-hidden="true">
          Scroll · ketuk kartu untuk flip
        </div>
      </div>
    </section>
  );
}
