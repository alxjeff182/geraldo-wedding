import { motion } from "framer-motion";
import { OPEN_EASE } from "../../constants/open-animation";
import type { HeroShortcutId } from "../../types/hero-shortcut";
import { HERO_SHORTCUT_LABELS } from "../../types/hero-shortcut";
import { ClockIcon } from "../ui/ClockIcon";
import { LocationIcon } from "../ui/LocationIcon";
import { RsvpIcon } from "../ui/RsvpIcon";

const shortcuts = [
  { id: "countdown" as const, label: HERO_SHORTCUT_LABELS.countdown, icon: ClockIcon },
  { id: "events" as const, label: HERO_SHORTCUT_LABELS.events, icon: LocationIcon },
  { id: "rsvp" as const, label: HERO_SHORTCUT_LABELS.rsvp, icon: RsvpIcon },
];

const trackVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: OPEN_EASE,
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: OPEN_EASE },
  },
};

type Props = {
  onOpen: (id: HeroShortcutId) => void;
};

export function HeroShortcuts({ onOpen }: Props) {
  return (
    <nav className="hero-shortcuts" aria-label="Navigasi cepat undangan">
      <motion.div
        className="hero-shortcuts__track"
        variants={trackVariants}
        initial="hidden"
        animate="visible"
      >
        {shortcuts.map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              className="hero-shortcut"
              aria-label={`Buka ${item.label}`}
              variants={buttonVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpen(item.id)}
            >
              <span className="hero-shortcut__shine" aria-hidden />
              <span className="hero-shortcut__icon" aria-hidden>
                <Icon />
              </span>
              <span className="hero-shortcut__label">{item.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
}
