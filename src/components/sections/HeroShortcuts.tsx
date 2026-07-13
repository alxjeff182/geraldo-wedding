import { motion } from "framer-motion";
import { OPEN_EASE } from "../../constants/open-animation";
import { useWeddingContent } from "../../context/WeddingContentContext";
import type { HeroShortcutId } from "../../types/hero-shortcut";
import { ClockIcon } from "../ui/ClockIcon";
import { LocationIcon } from "../ui/LocationIcon";
import { RsvpIcon } from "../ui/RsvpIcon";

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
  const { content } = useWeddingContent();
  const shortcuts = [
    { id: "countdown" as const, label: content.shortcuts.countdown, icon: ClockIcon },
    { id: "events" as const, label: content.shortcuts.events, icon: LocationIcon },
    { id: "rsvp" as const, label: content.shortcuts.rsvp, icon: RsvpIcon },
  ];

  return (
    <nav className="hero-shortcuts" aria-label={content.shortcuts.navAriaLabel}>
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
              aria-label={`${content.shortcuts.openAriaLabel} ${item.label}`}
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
