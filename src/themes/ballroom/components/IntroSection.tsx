type Props = {
  text: string;
};

export function IntroSection({ text }: Props) {
  if (!text.trim()) return null;

  return (
    <section id="intro" className="section intro-mod fade-up" aria-label="Undangan">
      <p className="intro-mod__text">{text}</p>
    </section>
  );
}
