import { MediaImage } from "../../../components/MediaImage";
import { useWeddingContent } from "../../../context/use-wedding-content";
import { hashtagExploreUrl } from "../../../lib/hashtag-url";
import { IconInstagram } from "../icons";

type Props = {
  title: string;
  tag: string;
  photo?: string;
  onToast?: (msg: string) => void;
};

export function HashtagSection({ title, tag, photo, onToast }: Props) {
  const { content } = useWeddingContent();
  if (!tag.trim()) return null;

  const display = tag.startsWith("#") ? tag : `#${tag}`;
  const explore = hashtagExploreUrl(tag);

  const copyTag = async () => {
    try {
      await navigator.clipboard.writeText(display);
      onToast?.(content.hashtag.copySuccess ?? "Hashtag disalin");
    } catch {
      onToast?.(content.giftUi.copyError || "Gagal menyalin");
    }
  };

  return (
    <section id="hashtag" className="section hashtag-mod fade-up" aria-label={title}>
      <div className="section__head">
        <p className="eyebrow">Share</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      {photo ? (
        <MediaImage
          className="hashtag-mod__photo"
          src={photo}
          alt=""
          width={720}
          height={480}
          loading="lazy"
        />
      ) : null}
      <button
        type="button"
        className="hashtag-mod__tag hashtag-mod__tag--btn"
        aria-label={`Salin ${display}`}
        onClick={() => void copyTag()}
      >
        {display}
      </button>
      <a
        className="hashtag-mod__ig"
        href={explore}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={content.hashtag.instagramButton || "Instagram"}
      >
        <IconInstagram />
      </a>
    </section>
  );
}
