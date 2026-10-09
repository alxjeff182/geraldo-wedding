import { describe, expect, it } from "vitest";
import {
  buildGiftWhatsappMessage,
  buildGuestWhatsAppUrl,
  buildRsvpWhatsappMessage,
  isValidWhatsAppPhone,
} from "./guest-whatsapp";

describe("guest-whatsapp", () => {
  it("fills RSVP template variables", () => {
    const msg = buildRsvpWhatsappMessage(
      "Halo {nama}, {kehadiran}, {jumlah}{ucapan} — {pasangan}",
      {
        nama: "Budi",
        kehadiran: "Hadir",
        jumlah: "2",
        ucapan: "Selamat!",
        pasangan: "Geraldo & Christin",
      },
    );
    expect(msg).toContain("Budi");
    expect(msg).toContain("Hadir");
    expect(msg).toContain("Ucapan: Selamat!");
    expect(msg).toContain("Geraldo & Christin");
  });

  it("fills gift template variables", () => {
    const msg = buildGiftWhatsappMessage("Gift {nama} via {metode} for {pasangan}", {
      nama: "Ani",
      metode: "QRIS",
      pasangan: "Geraldo & Christin",
    });
    expect(msg).toBe("Gift Ani via QRIS for Geraldo & Christin");
  });

  it("normalizes phone for WhatsApp URL", () => {
    expect(isValidWhatsAppPhone("081234567890")).toBe(true);
    const url = buildGuestWhatsAppUrl("081234567890", "halo");
    expect(url).toContain("https://wa.me/6281234567890?text=");
  });
});
