import { useWeddingContent } from "../../context/WeddingContentContext";

export function Quote() {
  const { content } = useWeddingContent();

  return (
    <section className="section-ulos px-6 py-12 text-center" aria-label="Ayat Alkitab">
      <p className="font-body mx-auto max-w-sm text-xs font-light leading-relaxed text-[#e1cdaa]">
        &ldquo;{content.bibleQuote}&rdquo;
      </p>
      <p className="font-body mt-3 text-xs font-light text-[#e1cdaa]">{content.bibleReference}</p>
      <img
        src={content.media.divider}
        alt=""
        className="divider-img mt-6"
        loading="lazy"
        width={320}
        height={74}
      />
    </section>
  );
}
