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

function launchHref(href: string, { newTab = false } = {}) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.rel = "noopener noreferrer";
  if (newTab) anchor.target = "_blank";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** Android Chrome intent → Google Maps app, with web fallback. */
export function buildAndroidMapsIntent(mapsUrl: string): string | null {
  const trimmed = mapsUrl.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const path = `${url.host}${url.pathname}${url.search}${url.hash}`;
  const fallback = encodeURIComponent(trimmed);
  return (
    `intent://${path}#Intent;scheme=${url.protocol.replace(":", "")};` +
    `package=com.google.android.apps.maps;S.browser_fallback_url=${fallback};end`
  );
}

/** iOS deep link into the Google Maps app. */
export function buildIosGoogleMapsUrl(query: string): string {
  return `comgooglemaps://?q=${encodeURIComponent(query.trim())}`;
}

function mapsQuery(input: MapsOpenInput): string {
  return (input.address || input.venue || input.mapsUrl).trim();
}

/**
 * Open the right maps target for the guest's OS:
 * - Android → Google Maps app intent (web fallback)
 * - iOS → comgooglemaps://, then web mapsUrl if the app isn't installed
 * - Mac / desktop → mapsUrl in a new tab
 */
export function openMaps(input: MapsOpenInput, userAgent = currentUserAgent()): boolean {
  const mapsUrl = input.mapsUrl?.trim();
  if (!mapsUrl) return false;

  const platform = detectPlatform(userAgent);

  if (platform === "android") {
    const intent = buildAndroidMapsIntent(mapsUrl);
    if (intent) {
      launchHref(intent);
      return true;
    }
    launchHref(mapsUrl, { newTab: true });
    return true;
  }

  if (platform === "ios") {
    const query = mapsQuery(input);
    if (query) {
      const deepLink = buildIosGoogleMapsUrl(query);
      launchHref(deepLink);
      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          launchHref(mapsUrl, { newTab: true });
        }
      }, 1200);
      return true;
    }
    launchHref(mapsUrl, { newTab: true });
    return true;
  }

  launchHref(mapsUrl, { newTab: true });
  return true;
}
