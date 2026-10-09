import { wedding, type WeddingConfig } from "../config/wedding.config";
import type { SiteContentOverrides } from "../types/site-content";
import { resolveInviteTemplates } from "../config/invite-templates";

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

/** Strip obsolete Batak media keys from CMS overrides before save. */
export function stripLockedMedia(overrides: SiteContentOverrides): SiteContentOverrides {
  if (!overrides.media) return overrides;
  const media = { ...overrides.media } as Record<string, unknown>;
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
  return { ...overrides, media: media as SiteContentOverrides["media"] };
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
  if (normalized.media) {
    const cleaned = stripLockedMedia({ media: normalized.media }).media;
    normalized.media = cleaned;
  }

  const merged = deepMerge(structuredClone(wedding) as WeddingConfig, normalized) as WeddingConfig;
  const whatsappTemplates = resolveInviteTemplates(
    [...merged.invite.whatsappTemplates],
    undefined,
  );

  const defaultTemplateId = whatsappTemplates.some(
    (item) => item.id === merged.invite.defaultTemplateId,
  )
    ? merged.invite.defaultTemplateId
    : (whatsappTemplates[0]?.id ?? "");

  return {
    ...merged,
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
