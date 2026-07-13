import { useEffect } from "react";
import type { WeddingConfig } from "../config/wedding.config";

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function usePageMeta(content: WeddingConfig) {
  useEffect(() => {
    document.title = content.site.title;

    setMeta("description", content.site.description);
    setMeta("og:title", content.site.title, true);
    setMeta("og:description", content.site.description, true);
    setMeta("og:image", content.media.ogImage, true);
    setMeta("twitter:title", content.site.title);
    setMeta("twitter:description", content.site.description);
    setMeta("twitter:image", content.media.ogImage);

    const icon = content.media.coverBg || content.media.ogImage;
    setLink("icon", icon);
    setLink("apple-touch-icon", icon);

    if (content.site.noIndex) {
      setMeta("robots", "noindex, nofollow");
    }
  }, [content]);
}
