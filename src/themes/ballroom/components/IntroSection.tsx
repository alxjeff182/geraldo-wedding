type Props = {
  text: string;
};

/** Prefer blank-line breaks; otherwise split after sentence-ending punctuation. */
function splitIntro(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (/\n\s*\n/.test(trimmed)) {
    return trimmed
      .split(/\n\s*\n+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  const sentences = trimmed
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((part) => part.trim())
    .filter(Boolean);
  return sentences.length > 1 ? sentences : [trimmed];
}

export function IntroSection({ text }: Props) {
  const paragraphs = splitIntro(text);
  if (!paragraphs.length) return null;

  const [lead, ...rest] = paragraphs;

  return (
    <section id="intro" className="intro-mod fade-up" aria-label="Undangan">
      <div className="intro-mod__inner">
        <p className="intro-mod__lead">{lead}</p>
        {rest.length ? (
          <>
            <span className="intro-mod__rule" aria-hidden="true" />
            {rest.map((paragraph, index) => (
              <p key={index} className="intro-mod__text">
                {paragraph}
              </p>
            ))}
          </>
        ) : null}
      </div>
    </section>
  );
}
