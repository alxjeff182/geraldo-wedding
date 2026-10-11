export type MapsPlatform = "ios" | "android" | "mac" | "desktop";

export type MapsOpenInput = {
  mapsUrl: string;
  address?: string;
  venue?: string;
  lat?: number;
  lng?: number;
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

function hasCoords(input: MapsOpenInput): input is MapsOpenInput & { lat: number; lng: number } {
  return (
    typeof input.lat === "number" &&
    typeof input.lng === "number" &&
    Number.isFinite(input.lat) &&
    Number.isFinite(input.lng)
  );
}

function mapsQuery(input: MapsOpenInput): string {
  const address = input.address?.trim() || "";
  const venue = input.venue?.trim() || "";
  if (address && venue && !address.toLowerCase().includes(venue.toLowerCase())) {
    return `${venue}, ${address}`;
  }
  return address || venue;
}

/**
 * geo: URI — Android routes this straight to the installed Maps app
 * (or the system chooser), without loading maps.app.goo.gl in Chrome first.
 */
export function buildAndroidGeoUrl(input: MapsOpenInput): string | null {
  const label = mapsQuery(input);
  if (hasCoords(input)) {
    const pin = `${input.lat},${input.lng}`;
    const q = label ? `${pin}(${label})` : pin;
    return `geo:${pin}?q=${encodeURIComponent(q)}`;
  }
  if (!label) return null;
  return `geo:0,0?q=${encodeURIComponent(label)}`;
}

/**
 * Intent into Google Maps with a search/coords query (not a goo.gl short link).
 * No browser_fallback_url — that field is what forces Chrome to open the web.
 */
export function buildAndroidMapsIntent(input: MapsOpenInput): string | null {
  const label = mapsQuery(input);
  let q = label;
  if (hasCoords(input)) q = `${input.lat},${input.lng}${label ? ` (${label})` : ""}`;
  if (!q) return null;
  const path = `maps.google.com/maps?q=${encodeURIComponent(q)}`;
  return `intent://${path}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
}

/**
 * iOS Google Maps deep link with turn-by-turn directions to the venue.
 * Prefers lat/lng so "Gedung Gorga, Jakarta" doesn't resolve to the wrong place.
 */
export function buildIosGoogleMapsUrl(input: MapsOpenInput): string | null {
  const label = mapsQuery(input);
  const dest = hasCoords(input)
    ? `${input.lat},${input.lng}`
    : label
      ? encodeURIComponent(label)
      : "";
  if (!dest) return null;
  return `comgooglemaps://?daddr=${dest}&directionsmode=driving`;
}

function openWithAppThenWebFallback(nativeHref: string, webHref: string, delayMs = 1500) {
  let leftPage = false;
  const markLeft = () => {
    leftPage = true;
  };
  window.addEventListener("blur", markLeft, { once: true });
  window.addEventListener("pagehide", markLeft, { once: true });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") markLeft();
    },
    { once: true },
  );

  launchNative(nativeHref);
  window.setTimeout(() => {
    window.removeEventListener("blur", markLeft);
    window.removeEventListener("pagehide", markLeft);
    if (leftPage || document.visibilityState !== "visible") return;
    launchNewTab(webHref);
  }, delayMs);
}

/**
 * Open the right maps target for the guest's OS:
 * - Android → geo: / Google Maps intent (app first; web only if still on page)
 * - iOS → Google Maps directions (daddr), then web mapsUrl if the app isn't installed
 * - Mac / desktop → mapsUrl in a new tab
 */
export function openMaps(input: MapsOpenInput, userAgent = currentUserAgent()): boolean {
  const mapsUrl = input.mapsUrl?.trim();
  if (!mapsUrl) return false;

  const platform = detectPlatform(userAgent);

  if (platform === "android") {
    const geo = buildAndroidGeoUrl(input);
    if (geo) {
      openWithAppThenWebFallback(geo, mapsUrl);
      return true;
    }
    const intent = buildAndroidMapsIntent(input);
    if (intent) {
      openWithAppThenWebFallback(intent, mapsUrl);
      return true;
    }
    launchNewTab(mapsUrl);
    return true;
  }

  if (platform === "ios") {
    const deepLink = buildIosGoogleMapsUrl(input);
    if (deepLink) {
      openWithAppThenWebFallback(deepLink, mapsUrl, 1200);
      return true;
    }
    launchNewTab(mapsUrl);
    return true;
  }

  launchNewTab(mapsUrl);
  return true;
}
