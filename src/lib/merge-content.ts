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
    for (const key of Object.keys(overrides)) {
      const baseVal = (base as Record<string, unknown>)[key];
      const overrideVal = overrides[key];
      if (overrideVal === undefined) continue;
      // Ignore unknown / removed Batak media keys from old CMS rows
      if (baseVal === undefined && isPlainObject(base) && "coverBg" in (base as object)) {
        const allowed = new Set(Object.keys(base as object));
        if (!allowed.has(key)) continue;
      }
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

/** Strip obsolete CMS keys before save / load. */
export function stripLockedMedia(overrides: SiteContentOverrides): SiteContentOverrides {
  const next = { ...overrides } as SiteContentOverrides & { guestGuide?: unknown };
  delete next.guestGuide;

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
    ]) {
      delete media[key];
    }
    next.media = media as SiteContentOverrides["media"];
  }

  return next;
}

export function mergeWeddingContent(overrides: SiteContentOverrides = {}): WeddingConfig {
  const normalized = structuredClone(overrides) as SiteContentOverrides;

  if (normalized.invite) {
    const invite = normalized.invite;
    if (!invite.whatsappTemplates?.length && invite.whatsappTemplate) {
      invite.whatsappTemplates = resolveInviteTemplates(undefined, invite.whatsappTemplate);
      delete invite.whatsappTemplate;
    }
  }

  // Drop removed fields from old CMS payloads
  if (normalized.site && "theme" in normalized.site) {
    delete (normalized.site as { theme?: unknown }).theme;
  }
  delete (normalized as SiteContentOverrides & { guestGuide?: unknown }).guestGuide;
  if (normalized.media) {
    const cleaned = stripLockedMedia({ media: normalized.media }).media;
    normalized.media = cleaned;
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
  const whatsappTemplates = resolveInviteTemplates([...merged.invite.whatsappTemplates], undefined);

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

  const story = {
    ...merged.story,
    milestones: migrateStoryMilestones(
      merged.story as WeddingConfig["story"] & { paragraphs?: string[] },
    ),
  };
  delete (story as { paragraphs?: string[] }).paragraphs;

  return {
    ...merged,
    events,
    story,
    bibleQuote,
    bibleReference,
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
