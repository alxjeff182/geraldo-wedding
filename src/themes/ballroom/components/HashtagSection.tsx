import { useState } from "react";
import { useWeddingContent } from "../../../context/use-wedding-content";
import { hashtagExploreUrl } from "../../../lib/hashtag-url";
import { shareStoryTemplate } from "../../../lib/share-story";
import { IconInstagram } from "../icons";

type Props = {
  title: string;
  tag: string;
  storyTemplate?: string;
  onToast?: (msg: string) => void;
};

export function HashtagSection({ title, tag, storyTemplate, onToast }: Props) {
  const { content } = useWeddingContent();
  const [sharing, setSharing] = useState(false);
  if (!tag.trim()) return null;

  const display = tag.startsWith("#") ? tag : `#${tag}`;
  const explore = hashtagExploreUrl(tag);
  const template = storyTemplate?.trim() || content.hashtag.storyTemplate?.trim() || "";
  const previewBg = content.hashtag.storyPreviewBg?.trim() || "/assets/ballroom/gallery/01.webp";
  const storyLabel = content.hashtag.storyButton || "Bagikan ke Story";
  const storyHint = content.hashtag.storyHint || "Pilih Instagram → Story";
  const lead = content.hashtag.lead || "Abadikan momen bersama kami di Instagram Story";

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
      <p className="hashtag-mod__lead">{lead}</p>
      {template ? (
        <div className="hashtag-mod__story">
          <div className="hashtag-mod__phone" aria-hidden="true">
            <img
              className="hashtag-mod__phone-bg"
              src={previewBg}
              alt=""
              width={270}
              height={480}
              loading="lazy"
              decoding="async"
            />
            <img
              className="hashtag-mod__phone-overlay"
              src={template}
              alt=""
              width={270}
              height={480}
              loading="lazy"
              decoding="async"
            />
          </div>
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
      <div className="hashtag-mod__actions">
        <button
          type="button"
          className="hashtag-mod__tag hashtag-mod__tag--pill"
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
          <IconInstagram size={18} />
        </a>
      </div>
    </section>
  );
}
