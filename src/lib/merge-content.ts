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
      result[key] = deepMerge(baseVal, overrideVal);
    }
    return result as T;
  }

  return overrides as T;
}

/** Drop CMS overrides for the locked first-section couple photo. */
export function stripLockedMedia(overrides: SiteContentOverrides): SiteContentOverrides {
  if (!overrides.media) return overrides;
  const media = { ...overrides.media };
  delete media.heroPhoto;
  delete media.portrait;
  return { ...overrides, media };
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
    media: {
      ...merged.media,
      // First-section couple photo is locked to the bundled asset.
      heroPhoto: wedding.media.heroPhoto,
      portrait: wedding.media.portrait,
    },
  };
}

export function getDefaultWeddingContent(): WeddingConfig {
  return structuredClone(wedding) as WeddingConfig;
}
