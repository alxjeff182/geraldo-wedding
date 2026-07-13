import type { GiftAccount, WeddingEvent } from "../config/wedding.config";

export type SiteContentOverrides = {
  site?: {
    title?: string;
    description?: string;
    url?: string;
    noIndex?: boolean;
    creator?: {
      name?: string;
      url?: string;
      websiteUrl?: string;
      instagramUrl?: string;
    };
  };
  couple?: {
    groom?: {
      shortName?: string;
      fullName?: string;
      instagram?: string;
      instagramHandle?: string;
      photo?: string;
    };
    bride?: {
      shortName?: string;
      fullName?: string;
      instagram?: string;
      instagramHandle?: string;
      photo?: string;
    };
  };
  date?: string;
  dateLabel?: string;
  dateShort?: string;
  location?: string;
  hero?: {
    eyebrow?: string;
    groomName?: string;
    brideName?: string;
  };
  intro?: string;
  quote?: string;
  bibleQuote?: string;
  bibleReference?: string;
  events?: WeddingEvent[];
  gallery?: {
    title?: string;
    subtitle?: string;
    images?: { src: string; alt: string }[];
  };
  gift?: {
    title?: string;
    description?: string;
    physicalAddress?: string;
    accounts?: GiftAccount[];
  };
  hashtag?: {
    title?: string;
    tag?: string;
    photo?: string;
  };
  closing?: {
    paragraphs?: string[];
  };
  media?: {
    coverBg?: string;
    desktopBg?: string;
    paperBg?: string;
    rumahBolon?: string;
    bunga?: string;
    divider?: string;
    closing?: string;
    ulos?: string;
    heroPhoto?: string;
    portrait?: string;
    audio?: string;
    video?: string;
    ogImage?: string;
  };
  rsvp?: {
    note?: string;
  };
};

export type SiteContentRow = {
  id: string;
  content: SiteContentOverrides;
  updated_at: string;
};
