import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAndroidGeoUrl,
  buildAndroidMapsIntent,
  buildIosGoogleMapsUrl,
  detectPlatform,
  openMaps,
} from "./maps-links";

describe("maps-links", () => {
  const mapsUrl = "https://maps.app.goo.gl/WSsX9X17dp7qSwqh6";
  const address = "Gedung Gorga, Jakarta";
  const venue = "Gedung Gorga";
  const coords = { lat: -6.1806164, lng: 106.7798582 };

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("detects iOS, iPadOS, Android, Mac, and Windows", () => {
    expect(detectPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("ios");
    expect(
      detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15", {
        platform: "MacIntel",
        maxTouchPoints: 5,
      }),
    ).toBe("ios");
    expect(
      detectPlatform(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe("android");
    expect(
      detectPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        { platform: "MacIntel", maxTouchPoints: 0 },
      ),
    ).toBe("mac");
    expect(
      detectPlatform(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe("desktop");
  });

  it("builds Android geo URI with coordinates", () => {
    expect(buildAndroidGeoUrl({ mapsUrl, address, venue, ...coords })).toBe(
      `geo:-6.1806164,106.7798582?q=${encodeURIComponent("-6.1806164,106.7798582(Gedung Gorga, Jakarta)")}`,
    );
    expect(buildAndroidGeoUrl({ mapsUrl, address: "" })).toBeNull();
  });

  it("builds Android Google Maps intent without web fallback", () => {
    const intent = buildAndroidMapsIntent({ mapsUrl, address, venue, ...coords });
    expect(intent).toContain("intent://maps.google.com/maps?q=");
    expect(intent).toContain("package=com.google.android.apps.maps");
    expect(intent).not.toContain("browser_fallback_url");
  });

  it("builds iOS Google Maps directions deep link with venue name + coordinates", () => {
    expect(buildIosGoogleMapsUrl({ mapsUrl, address, venue, ...coords })).toBe(
      `comgooglemaps://?daddr=${encodeURIComponent("Gedung Gorga")}@-6.1806164,106.7798582&directionsmode=driving`,
    );
  });

  it("openMaps launches Android geo URI via location.assign", () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { assign, href: "https://example.com" });

    const ok = openMaps(
      { mapsUrl, address, venue, ...coords },
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    );
    expect(ok).toBe(true);
    expect(assign).toHaveBeenCalledWith(
      `geo:-6.1806164,106.7798582?q=${encodeURIComponent("-6.1806164,106.7798582(Gedung Gorga, Jakarta)")}`,
    );
  });

  it("openMaps launches iOS directions deep link", () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { assign, href: "https://example.com" });

    openMaps(
      { mapsUrl, address, venue, ...coords },
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    );
    expect(assign).toHaveBeenCalledWith(
      `comgooglemaps://?daddr=${encodeURIComponent("Gedung Gorga")}@-6.1806164,106.7798582&directionsmode=driving`,
    );
  });

  it("openMaps opens desktop mapsUrl in new tab", () => {
    let href = "";
    let target = "";
    const createEl = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = createEl(tag);
      if (tag === "a") {
        Object.defineProperty(el, "click", {
          value() {
            href = (this as HTMLAnchorElement).href;
            target = (this as HTMLAnchorElement).target;
          },
        });
      }
      return el;
    });

    openMaps(
      { mapsUrl, address, venue, ...coords },
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    );
    expect(href).toContain("maps.app.goo.gl");
    expect(target).toBe("_blank");
  });

  it("returns false when mapsUrl is empty", () => {
    expect(openMaps({ mapsUrl: "" })).toBe(false);
  });
});
