import { motion } from "framer-motion";
import { useWeddingContent } from "../../context/WeddingContentContext";

export function Story() {
  const { content } = useWeddingContent();
  const story = content.story;
  if (!story.enabled) return null;

  return (
    <section id="story" className="section-story-wrap" aria-labelledby="story-heading">
      <div className="story-card">
        <p className="story-title">{story.title}</p>
        <h2 id="story-heading" className="story-subtitle">
          {story.subtitle}
        </h2>
        <div className="story-copy">
          {story.paragraphs.map((paragraph) => (
            <motion.p
              key={paragraph}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
