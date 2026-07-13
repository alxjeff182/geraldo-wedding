import { useWeddingContent } from "../../context/WeddingContentContext";

export function Closing() {
  const { content } = useWeddingContent();
  const coupleNames = `${content.couple.groom.shortName} & ${content.couple.bride.shortName}`;

  return (
    <section className="section-closing-wrap" aria-labelledby="closing-heading">
      <div className="closing-inner">
        <div
          className="hashtag-arch"
          style={{ backgroundImage: `url("${content.hashtag.photo}")` }}
          role="img"
          aria-label={content.hashtag.title}
        >
          <div className="hashtag-arch__spacer" aria-hidden />
        </div>

        <div className="closing-copy">
          {content.closing.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <h2 id="closing-heading" className="closing-names">
          {coupleNames}
        </h2>

        <p className="closing-hashtag">{content.hashtag.tag}</p>
      </div>
    </section>
  );
}
