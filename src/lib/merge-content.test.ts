import { describe, expect, it } from "vitest";
import { mergeWeddingContent } from "./merge-content";
import { wedding } from "../config/wedding.config";

describe("mergeWeddingContent", () => {
  it("returns defaults when overrides empty", () => {
    const merged = mergeWeddingContent({});
    expect(merged.site.title).toBe(wedding.site.title);
  });

  it("merges nested overrides", () => {
    const merged = mergeWeddingContent({
      site: { title: "Test & Partner" },
      hero: { groomName: "Test" },
    });
    expect(merged.site.title).toBe("Test & Partner");
    expect(merged.hero.groomName).toBe("Test");
    expect(merged.hero.brideName).toBe(wedding.hero.brideName);
  });

  it("replaces arrays entirely", () => {
    const merged = mergeWeddingContent({
      events: [
        {
          name: "Solo Event",
          dateLabel: "Sabtu",
          time: "10.00",
          venue: "Venue",
          address: "Addr",
          mapsUrl: "https://maps.example",
          startsAt: "2026-04-25T10:00:00+07:00",
          endsAt: "2026-04-25T12:00:00+07:00",
        },
      ],
    });
    expect(merged.events).toHaveLength(1);
    expect(merged.events[0].name).toBe("Solo Event");
  });

  it("ignores obsolete Batak media keys from CMS overrides", () => {
    const merged = mergeWeddingContent({
      media: {
        coverBg: "/assets/ballroom/cover-frame.jpg",
        // @ts-expect-error obsolete key from old CMS rows
        desktopBg: "https://example.com/batak.jpg",
      },
    });
    expect(merged.media.coverBg).toBe("/assets/ballroom/cover-frame.jpg");
    expect("desktopBg" in merged.media).toBe(false);
  });

  it("keeps story, guestGuide and guestbook on by default", () => {
    const merged = mergeWeddingContent({});
    expect(merged.story.enabled).toBe(true);
    expect(merged.guestGuide.enabled).toBe(true);
    expect(merged.guestbook.enabled).toBe(true);
    expect(merged.rsvp.deadline).toContain("2026-04-18");
    expect(merged.rsvp.guestCountOptions).toEqual(["1", "2", "3"]);
  });

  it("provides 3 invite templates by default", () => {
    const merged = mergeWeddingContent({});
    expect(merged.invite.whatsappTemplates).toHaveLength(3);
  });

  it("migrates legacy single whatsappTemplate override", () => {
    const merged = mergeWeddingContent({
      invite: { whatsappTemplate: "Halo {nama}" },
    });
    expect(merged.invite.whatsappTemplates[0].message).toBe("Halo {nama}");
  });
});
