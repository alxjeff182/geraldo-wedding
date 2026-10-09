type Props = {
  title: string;
  tag: string;
  photo?: string;
};

export function HashtagSection({ title, tag, photo }: Props) {
  if (!tag.trim()) return null;

  return (
    <section id="hashtag" className="section hashtag-mod fade-up" aria-label={title}>
      <div className="section__head">
        <p className="eyebrow">Share</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      {photo ? (
        <img className="hashtag-mod__photo" src={photo} alt="" width={720} height={480} />
      ) : null}
      <p className="hashtag-mod__tag">{tag}</p>
    </section>
  );
}
