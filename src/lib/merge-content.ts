import { wedding, type StoryMilestone, type WeddingConfig } from "../config/wedding.config";
import type { SiteContentOverrides } from "../types/site-content";
import { resolveInviteTemplates } from "../config/invite-templates";

function migrateStoryMilestones(
  story: WeddingConfig["story"] & { paragraphs?: string[] },
): StoryMilestone[] {
  const milestones = story.milestones;
  if (Array.isArray(milestones) && milestones.length > 0) {
    return milestones.map((item) => ({
      date: item.date ?? "",
      title: item.title ?? "",
      text: item.text ?? "",
      photo: item.photo ?? "",
    }));
  }
  const paragraphs = story.paragraphs;
  if (Array.isArray(paragraphs) && paragraphs.length > 0) {
    return paragraphs
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ date: "", title: "", text, photo: "" }));
  }
  return wedding.story.milestones.map((item) => ({ ...item }));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, overrides: unknown): T {
  if (overrides === undefined || overrides === null) return base;

  if (Array.isArray(overrides)) {
    return overrides as T;
  }

  if (isPlainObject(base) && isPlainObject(overrides)) {
    const result = { ...base } as Record<string, unknown>;
    const allowed = new Set(Object.keys(base as object));
    for (const key of Object.keys(overrides)) {
      const baseVal = (base as Record<string, unknown>)[key];
      const overrideVal = overrides[key];
      if (overrideVal === undefined) continue;
      // Ignore unknown / removed keys from old CMS rows
      if (baseVal === undefined && !allowed.has(key)) continue;
      result[key] = deepMerge(baseVal, overrideVal);
    }
    return result as T;
  }

  return overrides as T;
}

/** True when CMS/draft value differs from shipped default (non-empty). */
export function isOverridden(current: unknown, defaultValue: unknown): boolean {
  if (current === undefined || current === null) return false;
  if (typeof current === "string" && current.trim() === "") return false;
  return JSON.stringify(current) !== JSON.stringify(defaultValue);
}

function omitKeys<T extends Record<string, unknown>>(obj: T, keys: string[]): T {
  const next = { ...obj };
  for (const key of keys) delete next[key];
  return next;
}

/** Strip obsolete CMS keys before save / load. */
export function stripLockedMedia(overrides: SiteContentOverrides): SiteContentOverrides {
  const next = { ...overrides } as SiteContentOverrides & Record<string, unknown>;
  delete next.guestGuide;
  delete next.quote;
  delete next.closing;
  // Keep contact — used by Undangan (WA RSVP / gift templates).

  if (next.site?.creator) {
    next.site = {
      ...next.site,
      creator: omitKeys({ ...next.site.creator } as Record<string, unknown>, [
        "name",
        "instagramUrl",
      ]) as NonNullable<NonNullable<SiteContentOverrides["site"]>["creator"]>,
    };
  }

  if (next.couple) {
    const couple = { ...next.couple };
    for (const role of ["groom", "bride"] as const) {
      if (couple[role]) {
        couple[role] = omitKeys({ ...couple[role] } as Record<string, unknown>, [
          "instagram",
        ]) as (typeof couple)[typeof role];
      }
    }
    next.couple = couple;
  }

  if (next.coupleSection) {
    next.coupleSection = omitKeys({ ...next.coupleSection } as Record<string, unknown>, [
      "connector",
    ]) as SiteContentOverrides["coupleSection"];
  }

  if (next.cover) {
    next.cover = omitKeys({ ...next.cover } as Record<string, unknown>, [
      "eyebrow",
    ]) as SiteContentOverrides["cover"];
  }

  if (next.countdown) {
    next.countdown = omitKeys({ ...next.countdown } as Record<string, unknown>, [
      "title",
      "heading",
    ]) as SiteContentOverrides["countdown"];
  }

  if (next.gallery) {
    next.gallery = omitKeys({ ...next.gallery } as Record<string, unknown>, [
      "subtitle",
    ]) as SiteContentOverrides["gallery"];
  }

  if (next.eventsSection) {
    next.eventsSection = omitKeys({ ...next.eventsSection } as Record<string, unknown>, [
      "title",
      "titleEmbedded",
      "subtitle",
      "venueLabel",
      "venueLabelColon",
      "mapsButton",
      "sheetCalendarButton",
      "calendarIcsButton",
      "calendarFabLabel",
    ]) as SiteContentOverrides["eventsSection"];
  }

  if (next.gift) {
    next.gift = omitKeys({ ...next.gift } as Record<string, unknown>, [
      "physicalAddress",
    ]) as SiteContentOverrides["gift"];
  }

  if (next.giftUi) {
    next.giftUi = omitKeys({ ...next.giftUi } as Record<string, unknown>, [
      "bankLabel",
      "accountNumberLabel",
      "accountHolderPrefix",
      "copyAccountButton",
      "physicalGiftTitle",
      "copyAddressButton",
      "copyAddressSuccess",
    ]) as SiteContentOverrides["giftUi"];
  }

  if (next.hashtag) {
    next.hashtag = omitKeys({ ...next.hashtag } as Record<string, unknown>, [
      "storyPreviewBg",
    ]) as SiteContentOverrides["hashtag"];
  }

  if (next.guestbook) {
    next.guestbook = omitKeys({ ...next.guestbook } as Record<string, unknown>, [
      "pagerPrev",
      "pagerNext",
    ]) as SiteContentOverrides["guestbook"];
  }

  if (next.footer) {
    next.footer = omitKeys({ ...next.footer } as Record<string, unknown>, [
      "portfolioPrompt",
      "portfolioLinkLabel",
      "instagramAriaLabel",
      "ariaLabel",
    ]) as SiteContentOverrides["footer"];
  }

  if (next.shortcuts) {
    next.shortcuts = omitKeys({ ...next.shortcuts } as Record<string, unknown>, [
      "countdown",
      "navAriaLabel",
      "openAriaLabel",
    ]) as SiteContentOverrides["shortcuts"];
  }

  if (next.media) {
    const media = { ...next.media } as Record<string, unknown>;
    for (const key of [
      "desktopBg",
      "paperBg",
      "rumahBolon",
      "bunga",
      "divider",
      "closing",
      "ulos",
      "heroPhoto",
      "portrait",
      "video",
      "heroFramesBase",
      "heroFrameCount",
    ]) {
      delete media[key];
    }
    next.media = media as SiteContentOverrides["media"];
  }

  return next;
}

export function mergeWeddingContent(overrides: SiteContentOverrides = {}): WeddingConfig {
  const normalized = stripLockedMedia(structuredClone(overrides) as SiteContentOverrides);

  if (normalized.invite) {
    const invite = normalized.invite;
    if (!invite.whatsappTemplates?.length && invite.whatsappTemplate) {
      invite.whatsappTemplates = resolveInviteTemplates(undefined, invite.whatsappTemplate);
      delete invite.whatsappTemplate;
    }
  }

  if (normalized.site && "theme" in normalized.site) {
    delete (normalized.site as { theme?: unknown }).theme;
  }

  // Migrate legacy story.paragraphs → milestones before deepMerge so arrays replace cleanly.
  if (normalized.story) {
    const legacy = normalized.story as SiteContentOverrides["story"] & {
      paragraphs?: string[];
      milestones?: StoryMilestone[];
    };
    if (!legacy.milestones?.length && legacy.paragraphs?.length) {
      legacy.milestones = legacy.paragraphs
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({ date: "", title: "", text, photo: "" }));
    }
    delete legacy.paragraphs;
  }

  const merged = deepMerge(structuredClone(wedding) as WeddingConfig, normalized) as WeddingConfig;
  const defaultInvite = wedding.invite.whatsappTemplates[0];
  const whatsappTemplates = resolveInviteTemplates(
    [...merged.invite.whatsappTemplates],
    undefined,
  ).map((item) => {
    // One-time: replace retired default WA invite copy with the new formal template.
    const isLegacyDefault =
      /^Shalom,/m.test(item.message) ||
      item.message.includes("mengucap syukur kepada Tuhan Yesus Kristus");
    if (!isLegacyDefault || !defaultInvite) return item;
    return {
      ...item,
      id: defaultInvite.id,
      name: defaultInvite.name,
      message: defaultInvite.message,
    };
  });

  const defaultTemplateId = whatsappTemplates.some(
    (item) => item.id === merged.invite.defaultTemplateId,
  )
    ? merged.invite.defaultTemplateId
    : (whatsappTemplates[0]?.id ?? "");

  // CMS events arrays replace defaults wholesale — restore lat/lng/mapsCid from shipped
  // defaults when the CMS row is missing them (needed for native maps + embed place card).
  const events = merged.events.map((event) => {
    const fallback = wedding.events.find(
      (item) => item.name === event.name || item.mapsUrl === event.mapsUrl,
    );
    if (!fallback) return event;
    const hasCoords = typeof event.lat === "number" && typeof event.lng === "number";
    return {
      ...event,
      lat: hasCoords ? event.lat : fallback.lat,
      lng: hasCoords ? event.lng : fallback.lng,
      mapsCid: event.mapsCid || fallback.mapsCid,
    };
  });

  // One-time content migrate: CMS still has the previous Matthew quote.
  const cmsBibleRef = String(merged.bibleReference ?? "");
  const cmsBibleQuote = String(merged.bibleQuote ?? "");
  const legacyMatthew = cmsBibleRef === "Matius 19:6" || cmsBibleQuote.includes("bukan lagi dua");
  const bibleQuote = legacyMatthew ? wedding.bibleQuote : merged.bibleQuote;
  const bibleReference = legacyMatthew ? wedding.bibleReference : merged.bibleReference;

  // One-time: CMS still has a previous SEO / OG description.
  const cmsDescription = String(merged.site.description ?? "").trim();
  const legacySeoDescription =
    cmsDescription === "Pernikahan Geraldo & Christin. Tangerang, 24 Oktober 2026" ||
    cmsDescription ===
      "The Wedding Of Geraldo & Christin · Sabtu, 24 Oktober 2026. Dengan penuh sukacita, kami mengundang Anda hadir.";
  const site = legacySeoDescription
    ? { ...merged.site, description: wedding.site.description }
    : merged.site;

  // One-time: CMS still points OG preview to the bare field photo.
  const cmsOg = String(merged.media.ogImage ?? "").trim();
  const legacyOg =
    !cmsOg ||
    cmsOg.endsWith("/og-image.jpg") ||
    cmsOg.endsWith("/og-share.jpg") ||
    cmsOg.includes("/assets/ballroom/og-image.jpg") ||
    cmsOg.includes("/assets/ballroom/og-share.jpg");
  const media = legacyOg ? { ...merged.media, ogImage: wedding.media.ogImage } : merged.media;

  // One-time: CMS still has previous bride number, empty groom number, wrong holder, or old QRIS.
  const legacyBrideAccount = merged.gift.accounts.some(
    (account) =>
      account.side === "bride" &&
      (account.number === "6705188657" ||
        /priscilla|priscilia/i.test(String(account.holder ?? "")) ||
        (account.number === "2480419009" &&
          String(account.holder ?? "")
            .trim()
            .toLowerCase() !== "christin samosir")),
  );
  const legacyGroomAccount = merged.gift.accounts.some(
    (account) =>
      account.side === "groom" &&
      (!String(account.number ?? "").trim() ||
        /sibarani/i.test(String(account.holder ?? "")) ||
        (account.number === "5271021641" &&
          String(account.holder ?? "")
            .trim()
            .toLowerCase() !== "geraldo gracedo sudena")),
  );
  const cmsQrisBride = String(merged.gift.qrisBride ?? merged.gift.qris ?? "");
  const cmsQrisGroom = String(merged.gift.qrisGroom ?? "");
  const legacyGiftQris =
    /qris-dummy|qris-bride(?:-v2|-code|-qr)?\.(?:webp|jpg|jpeg|png)$|\/qris-bride\.(?:webp|jpg|jpeg|png)$/i.test(
      cmsQrisBride,
    ) ||
    /qris-dummy|qris-groom(?:-v2|-code|-qr)?\.(?:webp|jpg|jpeg|png)$|\/qris-groom\.(?:webp|jpg|jpeg|png)$/i.test(
      cmsQrisGroom,
    );
  const gift =
    legacyBrideAccount || legacyGroomAccount || legacyGiftQris
      ? {
          ...merged.gift,
          qris: wedding.gift.qris,
          qrisBride: wedding.gift.qrisBride,
          qrisGroom: wedding.gift.qrisGroom,
          accounts: wedding.gift.accounts,
        }
      : merged.gift;

  const story = {
    ...merged.story,
    milestones: migrateStoryMilestones(
      merged.story as WeddingConfig["story"] & { paragraphs?: string[] },
    ),
  };
  delete (story as { paragraphs?: string[] }).paragraphs;

  return {
    ...merged,
    site,
    media,
    events,
    story,
    bibleQuote,
    bibleReference,
    gift,
    invite: {
      ...merged.invite,
      whatsappTemplates,
      defaultTemplateId,
    },
  };
}

export function getDefaultWeddingContent(): WeddingConfig {
  return structuredClone(wedding) as WeddingConfig;
}
