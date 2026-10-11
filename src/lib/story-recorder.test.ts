import { describe, expect, it } from "vitest";
import { coverRect, extensionForMime, pickRecorderMimeType } from "./story-recorder";

describe("pickRecorderMimeType", () => {
  it("prefers MP4 AVC when supported", () => {
    expect(pickRecorderMimeType((m) => m === "video/mp4;codecs=avc1")).toBe(
      "video/mp4;codecs=avc1",
    );
  });

  it("falls back through the candidate list", () => {
    expect(pickRecorderMimeType((m) => m === "video/webm")).toBe("video/webm");
  });

  it("returns empty string when nothing is supported", () => {
    expect(pickRecorderMimeType(() => false)).toBe("");
  });
});

describe("coverRect", () => {
  it("crops landscape source to fill portrait destination", () => {
    const r = coverRect(1920, 1080, 720, 1280);
    expect(r.dw).toBe(720);
    expect(r.dh).toBe(1280);
    // Source is wider than 9:16 → crop left/right
    expect(r.sh).toBe(1080);
    expect(r.sw).toBeCloseTo(1080 * (720 / 1280), 1);
    expect(r.sx).toBeGreaterThan(0);
    expect(r.sy).toBe(0);
  });

  it("crops portrait source that is taller than destination", () => {
    const r = coverRect(720, 1600, 720, 1280);
    expect(r.sw).toBe(720);
    expect(r.sh).toBeCloseTo(720 / (720 / 1280), 1);
    expect(r.sy).toBeGreaterThan(0);
  });

  it("handles zero sizes safely", () => {
    const r = coverRect(0, 0, 720, 1280);
    expect(r.dw).toBe(720);
    expect(r.dh).toBe(1280);
  });
});

describe("extensionForMime", () => {
  it("maps mp4 mime types", () => {
    expect(extensionForMime("video/mp4")).toBe("mp4");
    expect(extensionForMime("video/mp4;codecs=avc1")).toBe("mp4");
  });

  it("maps webm mime types", () => {
    expect(extensionForMime("video/webm")).toBe("webm");
    expect(extensionForMime("video/webm;codecs=vp9")).toBe("webm");
  });
});
