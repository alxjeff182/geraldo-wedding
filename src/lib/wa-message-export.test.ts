import { describe, expect, it } from "vitest";
import { buildWaExportEntries, formatWaExportPlainText } from "./wa-message-export";

describe("wa-message-export", () => {
  const guests = [
    { id: "1", display_name: "Ade", phone: "0895391606832", slug: "ade" },
    { id: "2", display_name: "Salim", phone: null, slug: "salim" },
  ];

  it("builds numbered entries with wa urls when phone exists", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      index: 1,
      name: "Ade",
      hasPhone: true,
      message: "Halo Ade",
    });
    expect(entries[0].waUrl).toContain("https://wa.me/");
    expect(entries[0].waUrl).toContain(encodeURIComponent("Halo Ade"));
    expect(entries[1].hasPhone).toBe(false);
    expect(entries[1].waUrl).toBeNull();
  });

  it("formats a readable plain-text pack", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}\nLink: x`);
    const text = formatWaExportPlainText(entries);
    expect(text).toContain("Daftar pesan WhatsApp (2 tamu)");
    expect(text).toContain("1. Ade");
    expect(text).toContain("WA: 0895391606832");
    expect(text).toContain("Halo Ade");
    expect(text).toContain("2. Salim");
    expect(text).toContain("WA: (belum ada nomor)");
  });
});
