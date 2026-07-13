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
        },
      ],
    });
    expect(merged.events).toHaveLength(1);
    expect(merged.events[0].name).toBe("Solo Event");
  });

  it("provides 10 invite templates by default", () => {
    const merged = mergeWeddingContent({});
    expect(merged.invite.whatsappTemplates).toHaveLength(10);
  });

  it("migrates legacy single whatsappTemplate override", () => {
    const merged = mergeWeddingContent({
      invite: { whatsappTemplate: "Halo {nama}" },
    });
    expect(merged.invite.whatsappTemplates[0].message).toBe("Halo {nama}");
  });
});
