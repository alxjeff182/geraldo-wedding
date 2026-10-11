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

/** Caption-first title, e.g. "The Wedding Of · Geraldo & Christin". */
export function buildSeoTitle(content: WeddingConfig): string {
  const brand = content.site.title.trim();
  const eyebrow = content.hero.eyebrow.trim();
  if (!brand) return eyebrow || "Wedding";
  if (!eyebrow || brand.toLowerCase().includes(eyebrow.toLowerCase())) return brand;
  return `${eyebrow} · ${brand}`;
}

export function buildOgImageAlt(content: WeddingConfig): string {
  const brand = content.site.title.trim() || "Wedding";
  const eyebrow = content.hero.eyebrow.trim();
  const date = content.dateShort.trim() || content.dateLabel.trim();
  const lead = eyebrow ? `${eyebrow} · ${brand}` : brand;
  return date ? `${lead} — ${date}` : lead;
}

export function usePageMeta(content: WeddingConfig, options?: { noIndex?: boolean }) {
  useEffect(() => {
    const siteUrl = content.site.url;
    const ogImage = absoluteUrl(siteUrl, content.media.ogImage);
    const seoTitle = buildSeoTitle(content);
    const description = content.site.description.trim();
    const imageAlt = buildOgImageAlt(content);
    // Keep icon hrefs same-origin (relative). Absolute production URLs trip CORP
    // when the page is previewed on another host (LHCI localhost, Vercel previews).
    const icon = content.media.coverBg?.startsWith("http")
      ? "/icon-192.png"
      : content.media.coverBg || "/icon-192.png";

    document.title = seoTitle;

    setMeta("description", description);
    setMeta("author", content.site.title);
    setMeta("application-name", content.site.title);
    setMeta("apple-mobile-web-app-title", content.site.title);
    setMeta("theme-color", "#1a0f0c");

    setMeta("og:type", "website", true);
    setMeta("og:site_name", content.site.title, true);
    setMeta("og:title", seoTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:url", `${siteUrl.replace(/\/$/, "")}/`, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:image:type", "image/jpeg", true);
    setMeta("og:image:width", "720", true);
    setMeta("og:image:height", "1280", true);
    setMeta("og:image:alt", imageAlt, true);
    setMeta("og:locale", "id_ID", true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seoTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);
    setMeta("twitter:image:alt", imageAlt);

    setLink("icon", icon);
    setLink("apple-touch-icon", "/apple-touch-icon-180.png");
    setLink("canonical", `${siteUrl.replace(/\/$/, "")}/`);

    if (content.site.noIndex || options?.noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow, max-image-preview:large");
    }
  }, [content, options?.noIndex]);
}
