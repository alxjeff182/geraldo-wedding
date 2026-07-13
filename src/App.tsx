import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OPEN_EASE, COVER_OPEN_DURATION } from "./constants/open-animation";
import { useWeddingContent } from "./context/WeddingContentContext";
import { useGuestName } from "./hooks/useGuestName";
import { useAudio } from "./hooks/useAudio";
import { usePageMeta } from "./hooks/usePageMeta";
import { CoverScreen } from "./components/layout/CoverScreen";
import { AudioPlayer } from "./components/ui/AudioPlayer";
import { Toast } from "./components/ui/Toast";
import { useToast } from "./hooks/useToast";
import { Hero } from "./components/sections/Hero";
import { Quote } from "./components/sections/Quote";
import { SectionModal } from "./components/ui/SectionModal";
import type { HeroShortcutId } from "./types/hero-shortcut";
import { HERO_SHORTCUT_LABELS } from "./types/hero-shortcut";

const AdminPage = lazy(() =>
  import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);
const Couple = lazy(() => import("./components/sections/Couple").then((m) => ({ default: m.Couple })));
const Countdown = lazy(() =>
  import("./components/sections/Countdown").then((m) => ({ default: m.Countdown })),
);
const Events = lazy(() => import("./components/sections/Events").then((m) => ({ default: m.Events })));
const Gift = lazy(() => import("./components/sections/Gift").then((m) => ({ default: m.Gift })));
const Closing = lazy(() =>
  import("./components/sections/Closing").then((m) => ({ default: m.Closing })),
);
const Gallery = lazy(() =>
  import("./components/sections/Gallery").then((m) => ({ default: m.Gallery })),
);
const RsvpForm = lazy(() =>
  import("./components/sections/RsvpForm").then((m) => ({ default: m.RsvpForm })),
);
const Guestbook = lazy(() =>
  import("./components/sections/Guestbook").then((m) => ({ default: m.Guestbook })),
);
const SiteFooter = lazy(() =>
  import("./components/sections/SiteFooter").then((m) => ({ default: m.SiteFooter })),
);

function SectionFallback() {
  return <div className="h-32 animate-pulse bg-maroon-dark/30" aria-hidden />;
}

function DesktopSidebar({ opened }: { opened: boolean }) {
  const { content } = useWeddingContent();

  return (
    <motion.aside
      className="invitation-sidebar hidden md:flex flex-col justify-end p-12 text-left"
      style={{ backgroundImage: `url(${content.media.desktopBg})` }}
      aria-label="Informasi undangan desktop"
      initial={false}
      animate={
        opened
          ? { scale: 1, y: 0, opacity: 1 }
          : { scale: 1.06, y: "2%", opacity: 0.92 }
      }
      transition={{ duration: COVER_OPEN_DURATION, ease: OPEN_EASE }}
    >
      <div className="relative z-10">
        <p className="font-display text-xs tracking-[0.2em] text-cream uppercase">The Wedding Of</p>
        <h1 className="font-serif mt-2 text-5xl leading-[0.95] text-cream capitalize">
          {content.site.title}
        </h1>
        <p className="font-display mt-4 text-xs tracking-[0.2em] text-cream uppercase">
          {content.dateLabel}
        </p>
      </div>
    </motion.aside>
  );
}

type AppProps = {
  adminMode?: boolean;
};

export default function App({ adminMode = false }: AppProps) {
  const { content, loading: contentLoading } = useWeddingContent();
  const { guestName, guestId, loading: guestLoading } = useGuestName();
  const [opened, setOpened] = useState(false);
  const [shortcutModal, setShortcutModal] = useState<HeroShortcutId | null>(null);
  const { audioRef, playing, play, toggle } = useAudio();
  const { message, show, hide } = useToast();

  usePageMeta(content);

  useEffect(() => {
    if (adminMode) return;
    document.body.style.overflowY = "hidden";
    document.body.style.height = "100vh";
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflowY = "";
      document.body.style.height = "";
    };
  }, [adminMode]);

  const handleOpen = () => {
    if (opened) return;
    play();
    setOpened(true);
    document.body.style.overflowY = "";
    document.body.style.height = "";
    window.scrollTo(0, 0);
  };

  if (adminMode) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center bg-maroon-dark text-gold">
            Memuat admin...
          </div>
        }
      >
        <AdminPage />
      </Suspense>
    );
  }

  if (guestLoading || contentLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-maroon-dark text-gold">
        Memuat undangan...
      </div>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Lewati ke konten
      </a>

      <audio ref={audioRef} src={content.media.audio} loop preload="none" />

      <div
        className={`invitation-layout ${opened ? "invitation-open" : "invitation-locked"}`}
        aria-hidden={!opened}
      >
        <DesktopSidebar opened={opened} />
        <motion.main
          id="main-content"
          className="invitation-shell"
          initial={false}
          animate={
            opened
              ? { y: 0, scale: 1, opacity: 1 }
              : { y: "10%", scale: 1.05, opacity: 0.88 }
          }
          transition={{ duration: COVER_OPEN_DURATION, ease: OPEN_EASE }}
        >
          <Hero videoEnabled={opened} onShortcutOpen={setShortcutModal} />
          <Quote />
          <Suspense fallback={<SectionFallback />}>
            <Couple />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Countdown />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Events />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Gallery />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Gift onCopy={show} />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <RsvpForm guestId={guestId} onSuccess={show} />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Guestbook guestId={guestId} onSuccess={show} />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Closing />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SiteFooter />
          </Suspense>
        </motion.main>
      </div>

      {opened && <AudioPlayer playing={playing} onToggle={toggle} />}

      <SectionModal
        open={shortcutModal !== null}
        title={shortcutModal ? HERO_SHORTCUT_LABELS[shortcutModal] : ""}
        modalId={shortcutModal}
        onClose={() => setShortcutModal(null)}
      >
        {shortcutModal === "countdown" && (
          <Suspense fallback={<SectionFallback />}>
            <Countdown embedded />
          </Suspense>
        )}
        {shortcutModal === "events" && (
          <Suspense fallback={<SectionFallback />}>
            <Events embedded />
          </Suspense>
        )}
        {shortcutModal === "rsvp" && (
          <Suspense fallback={<SectionFallback />}>
            <RsvpForm guestId={guestId} onSuccess={show} embedded />
          </Suspense>
        )}
      </SectionModal>

      <AnimatePresence>
        {!opened && <CoverScreen guestName={guestName} onOpen={handleOpen} />}
      </AnimatePresence>

      {message && <Toast message={message} onClose={hide} />}
    </>
  );
}
