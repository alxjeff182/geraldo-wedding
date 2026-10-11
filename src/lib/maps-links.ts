export type MapsPlatform = "ios" | "android" | "mac" | "desktop";

export type MapsOpenInput = {
  mapsUrl: string;
  address?: string;
  venue?: string;
};

function currentUserAgent(): string {
  return typeof navigator !== "undefined" ? navigator.userAgent : "";
}

export function detectPlatform(
  userAgent = currentUserAgent(),
  opts?: { maxTouchPoints?: number; platform?: string },
): MapsPlatform {
  const ua = userAgent;
  const platform = opts?.platform ?? (typeof navigator !== "undefined" ? navigator.platform : "");
  const maxTouchPoints =
    opts?.maxTouchPoints ?? (typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0);
  const iOS = /iPad|iPhone|iPod/i.test(ua);
  const iPadOs = platform === "MacIntel" && maxTouchPoints > 1;
  if (iOS || iPadOs) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  return "desktop";
}

/** Prefer location.assign for native schemes — Chrome honors the user gesture better. */
function launchNative(href: string) {
  window.location.assign(href);
}

function launchNewTab(href: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.rel = "noopener noreferrer";
  anchor.target = "_blank";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function mapsQuery(input: MapsOpenInput): string {
  return (input.address || input.venue || "").trim();
}

/**
 * geo: URI — Android routes this straight to the installed Maps app
 * (or the system chooser), without loading maps.app.goo.gl in Chrome first.
 */
export function buildAndroidGeoUrl(query: string): string | null {
  const q = query.trim();
  if (!q) return null;
  return `geo:0,0?q=${encodeURIComponent(q)}`;
}

/**
 * Intent into Google Maps with a search query (not a goo.gl short link).
 * No browser_fallback_url — that field is what forces Chrome to open the web.
 */
export function buildAndroidMapsIntent(query: string): string | null {
  const q = query.trim();
  if (!q) return null;
  const path = `maps.google.com/maps?q=${encodeURIComponent(q)}`;
  return `intent://${path}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
}

/** iOS deep link into the Google Maps app. */
export function buildIosGoogleMapsUrl(query: string): string {
  return `comgooglemaps://?q=${encodeURIComponent(query.trim())}`;
}

function openWithAppThenWebFallback(nativeHref: string, webHref: string, delayMs = 1500) {
  const started = Date.now();
  launchNative(nativeHref);
  window.setTimeout(() => {
    // App took over → tab is hidden/backgrounded. Only fall back if still here.
    if (document.visibilityState !== "visible") return;
    if (Date.now() - started < delayMs - 100) return;
    launchNewTab(webHref);
  }, delayMs);
}

/**
 * Open the right maps target for the guest's OS:
 * - Android → geo: / Google Maps intent (app first; web only if still on page)
 * - iOS → comgooglemaps://, then web mapsUrl if the app isn't installed
 * - Mac / desktop → mapsUrl in a new tab
 */
export function openMaps(input: MapsOpenInput, userAgent = currentUserAgent()): boolean {
  const mapsUrl = input.mapsUrl?.trim();
  if (!mapsUrl) return false;

  const platform = detectPlatform(userAgent);
  const query = mapsQuery(input);

  if (platform === "android") {
    const geo = buildAndroidGeoUrl(query);
    if (geo) {
      openWithAppThenWebFallback(geo, mapsUrl);
      return true;
    }
    const intent = buildAndroidMapsIntent(query || mapsUrl);
    if (intent) {
      openWithAppThenWebFallback(intent, mapsUrl);
      return true;
    }
    launchNewTab(mapsUrl);
    return true;
  }

  if (platform === "ios") {
    if (query) {
      openWithAppThenWebFallback(buildIosGoogleMapsUrl(query), mapsUrl, 1200);
      return true;
    }
    launchNewTab(mapsUrl);
    return true;
  }

  launchNewTab(mapsUrl);
  return true;
}
