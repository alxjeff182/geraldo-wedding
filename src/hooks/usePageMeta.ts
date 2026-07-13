import { useEffect } from "react";
import { absoluteUrl } from "../lib/absolute-url";
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

export function usePageMeta(content: WeddingConfig, options?: { noIndex?: boolean }) {
  useEffect(() => {
    const siteUrl = content.site.url;
    const ogImage = absoluteUrl(siteUrl, content.media.ogImage);
    const icon = absoluteUrl(siteUrl, content.media.coverBg || content.media.ogImage);

    document.title = content.site.title;

    setMeta("description", content.site.description);
    setMeta("og:title", content.site.title, true);
    setMeta("og:description", content.site.description, true);
    setMeta("og:url", siteUrl.replace(/\/$/, ""), true);
    setMeta("og:image", ogImage, true);
    setMeta("twitter:title", content.site.title);
    setMeta("twitter:description", content.site.description);
    setMeta("twitter:image", ogImage);

    setLink("icon", icon);
    setLink("apple-touch-icon", icon);

    if (content.site.noIndex || options?.noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow");
    }
  }, [content, options?.noIndex]);
}
