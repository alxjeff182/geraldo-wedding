import { useState } from "react";
import { MediaImage } from "../../../components/MediaImage";
import { useWeddingContent } from "../../../context/use-wedding-content";
import { hashtagExploreUrl } from "../../../lib/hashtag-url";
import { shareStoryTemplate } from "../../../lib/share-story";
import { IconInstagram } from "../icons";

type Props = {
  title: string;
  tag: string;
  photo?: string;
  storyTemplate?: string;
  onToast?: (msg: string) => void;
};

export function HashtagSection({ title, tag, photo, storyTemplate, onToast }: Props) {
  const { content } = useWeddingContent();
  const [sharing, setSharing] = useState(false);
  if (!tag.trim()) return null;

  const display = tag.startsWith("#") ? tag : `#${tag}`;
  const explore = hashtagExploreUrl(tag);
  const template = storyTemplate?.trim() || content.hashtag.storyTemplate?.trim() || "";
  const storyLabel = content.hashtag.storyButton || "Bagikan ke Story";
  const storyHint = content.hashtag.storyHint || "Pilih Instagram → Story";

  const copyTag = async () => {
    try {
      await navigator.clipboard.writeText(display);
      onToast?.(content.hashtag.copySuccess ?? "Hashtag disalin");
    } catch {
      onToast?.(content.giftUi.copyError || "Gagal menyalin");
    }
  };

  const shareStory = async () => {
    if (!template || sharing) return;
    setSharing(true);
    try {
      const result = await shareStoryTemplate(
        template,
        display,
        content.hashtag.storyFallbackToast,
      );
      if (result.status === "fallback" && result.message) {
        onToast?.(result.message);
      } else if (result.status === "error") {
        onToast?.(result.message);
      }
    } finally {
      setSharing(false);
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
      {template ? (
        <div className="hashtag-mod__story">
          {/* Plain img: avoid MediaImage .webp swap when only PNG exists */}
          <img
            className="hashtag-mod__story-preview"
            src={template}
            alt="Preview template Instagram Story"
            width={108}
            height={192}
            loading="lazy"
            decoding="async"
          />
          <button
            type="button"
            className="btn hashtag-mod__story-btn"
            disabled={sharing}
            onClick={() => void shareStory()}
            aria-label={storyLabel}
          >
            <IconInstagram size={18} />
            <span>{sharing ? "Menyiapkan…" : storyLabel}</span>
          </button>
          <p className="hashtag-mod__story-hint">{storyHint}</p>
        </div>
      ) : null}
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
