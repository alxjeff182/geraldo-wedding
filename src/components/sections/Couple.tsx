import { motion } from "framer-motion";
import { useWeddingContent } from "../../context/WeddingContentContext";

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor" aria-hidden>
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );
}

export function Couple() {
  const { content } = useWeddingContent();
  const { groom, bride } = content.couple;

  return (
    <section
      className="relative overflow-hidden px-0 py-6 text-center"
      style={{
        backgroundImage: `url(${content.media.desktopBg})`,
        backgroundPosition: "center",
        backgroundSize: "450px auto",
      }}
      aria-labelledby="couple-heading"
    >
      <div className="couple-card">
        <p className="font-script text-[54px] leading-[0.8] text-gold">Sang</p>
        <h2 id="couple-heading" className="font-serif text-[33px] leading-[0.8] text-gold uppercase">
          Mempelai
        </h2>
        <p className="font-body mx-auto mb-6 mt-4 max-w-sm px-4 text-xs font-light leading-relaxed text-cream">
          {content.intro}
        </p>

        <motion.div
          className="couple-photo"
          style={{ backgroundImage: `url(${groom.photo})` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        />
        <p className="font-script mt-6 text-[54px] leading-[0.8] text-gold">{groom.shortName}</p>
        <p className="font-accent mt-2 text-[30px] leading-tight text-gold">{groom.fullName}</p>
        <a
          href={groom.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body mt-3 inline-flex items-center gap-2 text-xs text-gold-light"
        >
          <InstagramIcon />
          {groom.instagramHandle}
        </a>

        <p className="font-script my-6 text-[54px] leading-[0.8] text-gold">dengan</p>

        <motion.div
          className="couple-photo"
          style={{ backgroundImage: `url(${bride.photo})` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        />
        <p className="font-script mt-6 text-[54px] leading-[0.8] text-gold">{bride.shortName}</p>
        <p className="font-accent mt-2 text-[30px] leading-tight text-gold">{bride.fullName}</p>
        <a
          href={bride.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body mt-3 inline-flex items-center gap-2 text-xs text-gold-light"
        >
          <InstagramIcon />
          {bride.instagramHandle}
        </a>
      </div>
    </section>
  );
}
