import { wedding, type WeddingConfig } from "../config/wedding.config";
import type { SiteContentOverrides } from "../types/site-content";

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

export function mergeWeddingContent(overrides: SiteContentOverrides = {}): WeddingConfig {
  return deepMerge(structuredClone(wedding) as WeddingConfig, overrides);
}

export function getDefaultWeddingContent(): WeddingConfig {
  return structuredClone(wedding) as WeddingConfig;
}
