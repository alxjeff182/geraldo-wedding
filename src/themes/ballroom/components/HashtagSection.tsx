import { useState } from "react";
import { useWeddingContent } from "../../../context/use-wedding-content";
import { hashtagExploreUrl } from "../../../lib/hashtag-url";
import { IconInstagram } from "../icons";
import { StoryBooth } from "./StoryBooth";

type Props = {
  title: string;
  tag: string;
  storyTemplate?: string;
  onToast?: (msg: string) => void;
  onBoothOpen?: () => void;
  onBoothClose?: () => void;
};

export function HashtagSection({
  title,
  tag,
  storyTemplate,
  onToast,
  onBoothOpen,
  onBoothClose,
}: Props) {
  const { content } = useWeddingContent();
  const [boothOpen, setBoothOpen] = useState(false);
  if (!tag.trim()) return null;

  const display = tag.startsWith("#") ? tag : `#${tag}`;
  const explore = hashtagExploreUrl(tag);
  const template = storyTemplate?.trim() || content.hashtag.storyTemplate?.trim() || "";
  const previewBg = content.hashtag.storyPreviewBg?.trim() || "/assets/ballroom/gallery/01.webp";
  const boothLabel = content.hashtag.boothButton || "Rekam Video Story";
  const storyHint =
    content.hashtag.storyHint || "Rekam video dengan bingkai kami, lalu pilih Instagram → Story";
  const lead = content.hashtag.lead || "Abadikan momen bersama kami di Instagram Story";
  const maxSeconds = content.hashtag.boothMaxSeconds ?? 15;

  const openBooth = () => {
    if (!template) return;
    onBoothOpen?.();
    setBoothOpen(true);
  };

  const closeBooth = () => {
    setBoothOpen(false);
    onBoothClose?.();
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
            onClick={openBooth}
            aria-label={boothLabel}
          >
            <IconInstagram size={18} />
            <span>{boothLabel}</span>
          </button>
          <p className="hashtag-mod__story-hint">{storyHint}</p>
        </div>
      ) : null}
      <div className="hashtag-mod__actions">
        <button
          type="button"
          className="hashtag-mod__tag hashtag-mod__tag--pill"
          aria-label={`Salin ${display}`}
          onClick={() => {
            void navigator.clipboard.writeText(display).then(
              () => onToast?.(content.hashtag.copySuccess ?? "Hashtag disalin"),
              () => onToast?.(content.giftUi.copyError || "Gagal menyalin"),
            );
          }}
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
      {template ? (
        <StoryBooth
          open={boothOpen}
          overlayUrl={template}
          hashtag={display}
          maxSeconds={maxSeconds}
          shareLabel={content.hashtag.boothShare || "Bagikan ke Story"}
          retryLabel={content.hashtag.boothRetry || "Ulangi"}
          photoFallbackLabel={content.hashtag.storyButton || "Bagikan Foto"}
          deniedMessage={content.hashtag.boothDenied}
          fallbackToast={content.hashtag.storyFallbackToast}
          onClose={closeBooth}
          onToast={onToast}
        />
      ) : null}
    </section>
  );
}
