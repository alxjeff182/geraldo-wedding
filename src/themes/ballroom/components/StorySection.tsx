type Props = {
  subtitle: string;
  title: string;
  paragraphs: string[];
};

export function StorySection({ subtitle, title, paragraphs }: Props) {
  return (
    <section id="story" className="section story-mod fade-up" aria-label={title}>
      <div className="section__head">
        <p className="eyebrow">{subtitle}</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <div className="story-mod__body">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)} className="story-mod__p">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
