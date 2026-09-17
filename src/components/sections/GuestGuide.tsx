import { motion } from "framer-motion";
import { useWeddingContent } from "../../context/WeddingContentContext";

export function GuestGuide() {
  const { content } = useWeddingContent();
  const guide = content.guestGuide;
  if (!guide.enabled) return null;

  const tipLines = guide.tips
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section id="guest-guide" className="section-guide-wrap" aria-labelledby="guide-heading">
      <div className="guide-card">
        <p className="guide-title">{guide.title}</p>
        <h2 id="guide-heading" className="guide-subtitle">
          {guide.subtitle}
        </h2>

        <div className="guide-grid">
          <motion.article
            className="guide-block"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="guide-block__title">{guide.dressCodeTitle}</h3>
            <p className="guide-block__body">{guide.dressCode}</p>
          </motion.article>

          <motion.article
            className="guide-block"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            <h3 className="guide-block__title">{guide.tipsTitle}</h3>
            <div className="guide-block__body">
              {tipLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
