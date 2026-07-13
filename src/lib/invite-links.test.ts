import { describe, expect, it } from "vitest";
import {
  buildGuestInviteUrl,
  buildWhatsAppUrl,
  formatInviteMessage,
  normalizePhoneForWhatsApp,
  slugifyGuestName,
} from "./invite-links";

describe("invite-links", () => {
  it("slugifies guest names", () => {
    expect(slugifyGuestName("Jeffry & Istri")).toBe("jeffry-istri");
    expect(slugifyGuestName("  Budi Santoso  ")).toBe("budi-santoso");
  });

  it("normalizes Indonesian phone numbers", () => {
    expect(normalizePhoneForWhatsApp("081234567890")).toBe("6281234567890");
    expect(normalizePhoneForWhatsApp("+62 812-3456-7890")).toBe("6281234567890");
    expect(normalizePhoneForWhatsApp("6281234567890")).toBe("6281234567890");
  });

  it("builds guest invite URLs", () => {
    expect(buildGuestInviteUrl("https://geraldo-christin.vercel.app/", "jeffry-istri")).toBe(
      "https://geraldo-christin.vercel.app/?guest=jeffry-istri",
    );
  });

  it("formats invite messages with variables", () => {
    const message = formatInviteMessage("Halo {nama}, buka {link}", {
      nama: "Budi",
      link: "https://example.com/?guest=budi",
      tanggal: "25 APRIL",
      lokasi: "Tangerang",
      pasangan: "Geraldo & Christin",
      salam: "Yth.",
      slug: "budi",
    });
    expect(message).toBe("Halo Budi, buka https://example.com/?guest=budi");
  });

  it("builds WhatsApp deep links", () => {
    const url = buildWhatsAppUrl("081234567890", "Halo");
    expect(url).toBe("https://wa.me/6281234567890?text=Halo");
  });
});
