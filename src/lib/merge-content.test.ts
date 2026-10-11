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
          startsAt: "2026-10-24T10:00:00+07:00",
          endsAt: "2026-10-24T12:00:00+07:00",
        },
      ],
    });
    expect(merged.events).toHaveLength(1);
    expect(merged.events[0].name).toBe("Solo Event");
  });

  it("restores lat/lng from defaults when CMS events omit them", () => {
    const base = wedding.events[1];
    const merged = mergeWeddingContent({
      events: [
        {
          name: base.name,
          dateLabel: base.dateLabel,
          time: base.time,
          venue: base.venue,
          address: base.address,
          mapsUrl: base.mapsUrl,
          startsAt: base.startsAt,
          endsAt: base.endsAt,
        },
      ],
    });
    expect(merged.events[0].lat).toBe(base.lat);
    expect(merged.events[0].lng).toBe(base.lng);
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

  it("strips dead CMS keys but keeps contact and invite", () => {
    const merged = mergeWeddingContent({
      // @ts-expect-error obsolete top-level keys
      quote: { text: "old" },
      // @ts-expect-error obsolete top-level keys
      closing: { paragraphs: ["bye"] },
      contact: { whatsappNumber: "6281111111111" },
      invite: { salutation: "Yth. Bapak/Ibu" },
      cover: {
        salutation: "Kepada Yth.",
        // @ts-expect-error obsolete nested key
        eyebrow: "legacy",
      },
      guestbook: {
        title: "Ucapan",
        // @ts-expect-error obsolete nested key
        pagerPrev: "Sebelumnya",
      },
      couple: {
        groom: {
          shortName: "G",
          // @ts-expect-error obsolete nested key
          instagram: "https://instagram.com/x",
        },
      },
    });
    expect("quote" in merged).toBe(false);
    expect("closing" in merged).toBe(false);
    expect(merged.contact.whatsappNumber).toBe("6281111111111");
    expect(merged.invite.salutation).toBe("Yth. Bapak/Ibu");
    expect("eyebrow" in merged.cover).toBe(false);
    expect("pagerPrev" in merged.guestbook).toBe(false);
    expect("instagram" in merged.couple.groom).toBe(false);
    expect(merged.couple.groom.shortName).toBe("G");
  });

  it("keeps story and guestbook on by default", () => {
    const merged = mergeWeddingContent({});
    expect(merged.story.enabled).toBe(true);
    expect(merged.guestbook.enabled).toBe(true);
    expect("guestGuide" in merged).toBe(false);
    expect(merged.rsvp.deadline).toContain("2026-10-17");
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

  it("migrates legacy Matthew bible quote to Song of Songs", () => {
    const merged = mergeWeddingContent({
      bibleQuote:
        "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
      bibleReference: "Matius 19:6",
    });
    expect(merged.bibleQuote).toBe(wedding.bibleQuote);
    expect(merged.bibleReference).toBe("Kidung Agung 2:16");
  });

  it("migrates legacy story.paragraphs into milestones", () => {
    const merged = mergeWeddingContent({
      story: {
        paragraphs: ["Kami bertemu di kampus.", "Lalu tumbuh bersama."],
      },
    });
    expect(merged.story.milestones).toHaveLength(2);
    expect(merged.story.milestones[0]).toMatchObject({
      date: "",
      title: "",
      text: "Kami bertemu di kampus.",
      photo: "",
    });
    expect(merged.story.milestones[1].text).toBe("Lalu tumbuh bersama.");
    expect("paragraphs" in merged.story).toBe(false);
  });

  it("keeps story milestones when provided", () => {
    const merged = mergeWeddingContent({
      story: {
        milestones: [{ date: "2020", title: "Bertemu", text: "Di Jakarta", photo: "" }],
      },
    });
    expect(merged.story.milestones).toHaveLength(1);
    expect(merged.story.milestones[0].title).toBe("Bertemu");
  });

  it("replaces legacy gift accounts and QRIS from defaults", () => {
    const merged = mergeWeddingContent({
      gift: {
        qrisGroom: "/assets/ballroom/qris-dummy.svg",
        accounts: [
          {
            bank: "BCA",
            number: "6705188657",
            holder: "Christin Samosir, S.M.",
            logo: "/assets/ballroom/bca-logo.png",
            side: "bride",
          },
          {
            bank: "BCA",
            number: "",
            holder: "Geraldo Gracedo Sudena Tampubolon",
            logo: "/assets/ballroom/bca-logo.png",
            side: "groom",
          },
        ],
      },
    });
    const bride = merged.gift.accounts.find((account) => account.side === "bride");
    const groom = merged.gift.accounts.find((account) => account.side === "groom");
    expect(bride?.number).toBe("2480419009");
    expect(bride?.holder).toBe("Christin Samosir");
    expect(groom?.number).toBe("5271021641");
    expect(groom?.holder).toBe("Geraldo Gracedo Sudena");
    expect(merged.gift.qrisBride).toContain("qris-bride-v2");
    expect(merged.gift.qrisGroom).toContain("qris-groom-v2");
  });
});
