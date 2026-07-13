import { motion } from "framer-motion";
import { useState } from "react";
import {
  COVER_OPEN_DURATION,
  OPEN_EASE,
} from "../../constants/open-animation";
import { useWeddingContent } from "../../context/WeddingContentContext";
import { LeafIcon } from "../ui/LeafIcon";

const OPEN_DURATION = COVER_OPEN_DURATION;

type Props = {
  guestName: string;
  onOpen: () => void;
};

export function CoverScreen({ guestName, onOpen }: Props) {
  const { content } = useWeddingContent();
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    onOpen();
  };

  return (
    <motion.div
      className="cover-screen flex items-center justify-center overflow-hidden"
      initial={false}
      exit={{ opacity: 0, y: "-18%", scale: 1.04 }}
      transition={{ duration: OPEN_DURATION, ease: OPEN_EASE }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${content.media.coverBg})` }}
        initial={false}
        exit={{ scale: 1.14, y: "-6%" }}
        transition={{ duration: OPEN_DURATION, ease: OPEN_EASE }}
        aria-hidden
      />

      <motion.div
        className="cover-panel relative z-10 flex min-h-dvh flex-col items-center justify-center px-8 py-10 text-center"
        initial={false}
        exit={{ opacity: 0, y: "-28%", scale: 0.96 }}
        transition={{ duration: OPEN_DURATION, ease: OPEN_EASE }}
      >
        <motion.img
          src={content.media.rumahBolon}
          alt={content.cover.rumahBolonAlt}
          className="mb-5 w-[38%] max-w-[180px]"
          width={180}
          height={223}
          fetchPriority="high"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        />
        <motion.p
          className="font-display text-xs tracking-[0.2em] text-gold uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {content.cover.eyebrow}
        </motion.p>
        <motion.h1
          className="font-serif mt-3 text-[34px] leading-[0.9] font-medium text-gold uppercase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          {content.site.title}
        </motion.h1>
        <motion.p
          className="font-label mt-5 text-[13px] tracking-[0.05em] text-gold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {content.cover.salutation}
        </motion.p>
        <motion.p
          className="font-label mt-1 text-[13px] tracking-[0.05em] text-gold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {guestName}
        </motion.p>
        <motion.button
          type="button"
          className="btn-gold mt-8"
          onClick={handleOpen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          style={{ visibility: opening ? "hidden" : "visible" }}
          aria-label={content.cover.openButtonAriaLabel}
        >
          <LeafIcon />
          {content.cover.openButton}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
