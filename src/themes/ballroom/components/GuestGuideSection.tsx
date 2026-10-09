type Props = {
  subtitle: string;
  title: string;
  dressCodeTitle: string;
  dressCode: string;
  tipsTitle: string;
  tips: string;
};

export function GuestGuideSection({
  subtitle,
  title,
  dressCodeTitle,
  dressCode,
  tipsTitle,
  tips,
}: Props) {
  return (
    <section id="guest-guide" className="section guide-mod fade-up" aria-label={title}>
      <div className="section__head">
        <p className="eyebrow">{subtitle}</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <div className="guide-mod__grid">
        <article className="guide-card">
          <p className="guide-card__label">{dressCodeTitle}</p>
          <p className="guide-card__text">{dressCode}</p>
        </article>
        <article className="guide-card">
          <p className="guide-card__label">{tipsTitle}</p>
          <p className="guide-card__text" style={{ whiteSpace: "pre-line" }}>
            {tips}
          </p>
        </article>
      </div>
    </section>
  );
}
