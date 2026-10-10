import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWeddingContent } from "../../context/use-wedding-content";
import { useAudio } from "../../hooks/useAudio";
import { useToast } from "../../hooks/useToast";
import { MediaImage } from "../../components/MediaImage";
import { Toast } from "../../components/ui/Toast";
import { usePageMeta } from "../../hooks/usePageMeta";
import { Cover } from "./components/Cover";
import { OpeningVideo } from "./components/OpeningVideo";
import { Hero } from "./components/Hero";
import { CoupleStory } from "./components/CoupleStory";
import { StorySection } from "./components/StorySection";
import { EventCard } from "./components/EventCard";
import { GuestGuideSection } from "./components/GuestGuideSection";
import { Gallery3D } from "./components/Gallery3D";
import { GiftHub } from "./components/GiftHub";
import { IntroSection } from "./components/IntroSection";
import { HashtagSection } from "./components/HashtagSection";
import { Wishes } from "./components/Wishes";
import { FloatDock } from "./components/FloatDock";
import { IconMusic, IconMusicOff } from "./icons";
import { RsvpSheet } from "./sheets/RsvpSheet";
import { LocationSheet } from "./sheets/LocationSheet";
import { GiftSheet } from "./sheets/GiftSheet";
import { useSheet } from "./hooks/useSheet";
import { useInvitationFx } from "./hooks/useInvitationFx";
import "./ballroom.css";

const DOCK_AT = 0.3;

type Props = {
  guestName: string;
  guestId: string | null;
};

function QuoteWithEm({ text }: { text: string }) {
  const parts = text.split(/(\bsatu\b)/i);
  return (
    <p>
      {parts.map((part, i) =>
        /^satu$/i.test(part) ? <em key={i}>{part}</em> : <span key={i}>{part}</span>,
      )}
    </p>
  );
}

export function BallroomApp({ guestName, guestId }: Props) {
  const { content } = useWeddingContent();
  usePageMeta(content);

  const stageRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [inFirstSection, setInFirstSection] = useState(true);
  const { audioRef, play, toggle, playing } = useAudio();
  const { message, show, hide } = useToast();
  const hasAudio = Boolean(content.media.audio?.trim());

  const inertTargets = useMemo(
    () => [inviteRef.current, document.getElementById("ballroom-dock")],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revealed],
  );
  const sheet = useSheet({ inertTargets });

  useInvitationFx(inviteRef, revealed);

  useEffect(() => {
    document.body.classList.add("theme-ballroom-host");
    return () => document.body.classList.remove("theme-ballroom-host");
  }, []);

  useEffect(() => {
    const root = inviteRef.current;
    if (!root || !revealed) return;
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (!hero) return;
      const viewH = root.clientHeight || 1;
      setInFirstSection(root.scrollTop < hero.offsetHeight - viewH * 0.2);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [revealed]);

  const startOpening = () => {
    if (opening || revealed) return;
    setLeaving(true);
    setOpening(true);
    if (hasAudio) play();
  };

  const onReveal = useCallback(() => {
    setOpening(false);
    setRevealed(true);
    setLeaving(true);
  }, []);

  const coupleTitle = `${content.couple.groom.shortName} & ${content.couple.bride.shortName}`;
  const dockVisible = revealed && inFirstSection && heroProgress >= DOCK_AT && !sheet.isOpen;

  const dateFooter = content.dateLabel.includes("·")
    ? content.dateLabel
    : content.dateLabel.replace(", ", " · ");

  return (
    <div className={`theme-ballroom${!revealed ? " is-locked" : ""}`}>
      <div ref={stageRef} className={`stage${sheet.isOpen ? " is-sheet-open" : ""}`} id="stage">
        {hasAudio ? <audio ref={audioRef} src={content.media.audio} loop preload="auto" /> : null}

        {hasAudio && revealed ? (
          <button
            type="button"
            className={`audio-fab${playing ? " is-playing" : ""}`}
            aria-label={playing ? content.music.muteLabel : content.music.playLabel}
            aria-pressed={playing}
            onClick={toggle}
          >
            {playing ? <IconMusic /> : <IconMusicOff />}
          </button>
        ) : null}

        {!revealed ? (
          <Cover
            guestName={guestName === "Tamu Undangan" ? "" : guestName}
            salutation={content.cover.salutation}
            dateLabel={content.dateLabel}
            openLabel={content.cover.openButton}
            openAria={content.cover.openButtonAriaLabel}
            logoSrc={content.media.logo}
            coverBg={content.media.coverBg}
            onOpen={startOpening}
            leaving={leaving}
          />
        ) : null}

        <OpeningVideo
          active={opening}
          src={content.media.openingVideo}
          poster={content.media.coverBg}
          skipLabel={content.opening.skipLabel}
          onReveal={onReveal}
        />

        <main
          id="invitation"
          ref={inviteRef}
          className={`invitation${revealed ? " is-revealed" : ""}`}
          hidden={!revealed}
        >
          <Hero
            scrollRootRef={inviteRef}
            eyebrow={content.hero.eyebrow}
            groomName={content.hero.groomName?.trim() || content.couple.groom.shortName}
            brideName={content.hero.brideName?.trim() || content.couple.bride.shortName}
            weddingDate={content.date}
            dateLabel={content.dateLabel}
            labels={content.countdown.labels}
            framesBase={content.media.heroFramesBase}
            frameCount={content.media.heroFrameCount}
            posterSrc={content.media.heroPoster}
            enabled={revealed}
            onProgress={setHeroProgress}
          />
          <CoupleStory
            scrollRootRef={inviteRef}
            eyebrow="The Couple"
            title={`${content.coupleSection.prefix} ${content.coupleSection.title}`}
            groom={{
              role: "Mempelai Pria",
              name: content.couple.groom.shortName,
              fullName: content.couple.groom.fullName,
              parents: content.couple.groom.parents,
              photo: content.couple.groom.photo,
              instagramHandle: content.couple.groom.instagramHandle,
            }}
            bride={{
              role: "Mempelai Wanita",
              name: content.couple.bride.shortName,
              fullName: content.couple.bride.fullName,
              parents: content.couple.bride.parents,
              photo: content.couple.bride.photo,
              instagramHandle: content.couple.bride.instagramHandle,
            }}
            enabled={revealed}
          />
          <IntroSection text={content.intro} />
          <section id="quote" className="quote" aria-label="Ayat">
            <blockquote className="quote__card">
              <span className="quote__mark" aria-hidden="true">
                “
              </span>
              <QuoteWithEm text={content.bibleQuote} />
              <div className="quote__divider" aria-hidden="true">
                <span />
                <i />
                <span />
              </div>
              <cite>{content.bibleReference}</cite>
            </blockquote>
          </section>
          <EventCard
            eyebrow="Save the Date"
            title={content.eventsSection.titleEmbedded}
            events={[...content.events]}
            mapsLabel={content.eventsSection.mapsButton}
            calendarLabel={content.eventsSection.calendarGoogleButton}
            calendarIcsLabel={content.eventsSection.calendarIcsButton}
          />
          <Gallery3D
            eyebrow="Moments"
            title={content.gallery.title}
            images={[...content.gallery.images]}
            scrollRootRef={inviteRef}
            enabled={revealed}
          />
          <GiftHub
            title={content.gift.title}
            description={content.gift.description}
            accounts={[...content.gift.accounts]}
            qris={content.gift.qris}
            physicalAddress={content.gift.physicalAddress}
            physicalGiftTitle={content.giftUi.physicalGiftTitle}
            copyAddressButton={content.giftUi.copyAddressButton}
            copyAddressSuccess={content.giftUi.copyAddressSuccess}
            copySuccess={content.giftUi.copyAccountSuccess}
            copyError={content.giftUi.copyError}
            waNumber={content.contact.whatsappNumber}
            waTemplate={content.contact.giftWhatsappTemplate}
            guestName={guestName}
            coupleTitle={coupleTitle}
            onToast={show}
          />
          {content.story.enabled ? (
            <StorySection
              subtitle={content.story.subtitle}
              title={content.story.title}
              paragraphs={[...content.story.paragraphs]}
            />
          ) : null}
          {content.guestGuide.enabled ? (
            <GuestGuideSection
              subtitle={content.guestGuide.subtitle}
              title={content.guestGuide.title}
              dressCodeTitle={content.guestGuide.dressCodeTitle}
              dressCode={content.guestGuide.dressCode}
              tipsTitle={content.guestGuide.tipsTitle}
              tips={content.guestGuide.tips}
            />
          ) : null}
          {content.guestbook.enabled ? (
            <Wishes guestId={guestId} guestName={guestName} onToast={show} />
          ) : null}
          <HashtagSection
            title={content.hashtag.title}
            tag={content.hashtag.tag}
            photo={content.hashtag.photo}
            onToast={show}
          />
          <footer className="footer">
            <div className="footer__glow" aria-hidden="true" />
            <MediaImage
              className="footer__logo"
              src={content.media.logo}
              alt=""
              width={562}
              height={562}
              loading="lazy"
            />
            <p className="eyebrow">Dengan penuh kasih</p>
            <p className="footer__names">{content.site.title}</p>
            {content.quote?.trim() ? <p className="footer__quote">{content.quote}</p> : null}
            <div className="ornament" aria-hidden="true" />
            {content.closing.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="footer__msg">
                {p}
              </p>
            ))}
            <p className="footer__date">{dateFooter}</p>
            <div className="footer__credits">
              <p className="footer__copy">
                {content.footer.creditPrefix} {content.site.creator.name}
              </p>
              {content.footer.portfolioPrompt ? (
                <p className="footer__prompt">{content.footer.portfolioPrompt}</p>
              ) : null}
              <div className="footer__links">
                {content.site.creator.websiteUrl || content.site.creator.url ? (
                  <a
                    href={content.site.creator.websiteUrl || content.site.creator.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={content.footer.websiteAriaLabel}
                  >
                    Web
                  </a>
                ) : null}
                {content.site.creator.instagramUrl ? (
                  <a
                    href={content.site.creator.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={content.footer.instagramAriaLabel}
                  >
                    IG
                  </a>
                ) : null}
              </div>
            </div>
          </footer>
        </main>

        <FloatDock
          visible={dockVisible}
          onOpen={sheet.open}
          labels={{
            rsvp: content.shortcuts.rsvp,
            location: content.shortcuts.events,
            gift: content.giftUi.openButton,
          }}
        />

        <div
          className={`sheet-backdrop${sheet.isOpen ? " is-open" : ""}`}
          hidden={!sheet.isOpen}
          onClick={sheet.close}
        />
        <RsvpSheet
          open={sheet.activeId === "rsvp"}
          guestId={guestId}
          guestName={guestName === "Tamu Undangan" ? "" : guestName}
          onClose={sheet.close}
          setSheetRef={(el) => sheet.setSheetRef("rsvp", el)}
          onToast={show}
        />
        <LocationSheet
          open={sheet.activeId === "location"}
          events={[...content.events]}
          mapsLabel={content.eventsSection.sheetMapsButton}
          calendarLabel={content.eventsSection.sheetCalendarButton}
          onClose={sheet.close}
          setSheetRef={(el) => sheet.setSheetRef("location", el)}
          onToast={show}
        />
        <GiftSheet
          open={sheet.activeId === "gift"}
          guestName={guestName === "Tamu Undangan" ? "" : guestName}
          onClose={sheet.close}
          setSheetRef={(el) => sheet.setSheetRef("gift", el)}
          onToast={show}
        />

        {message ? <Toast message={message} onClose={hide} /> : null}
      </div>
    </div>
  );
}
