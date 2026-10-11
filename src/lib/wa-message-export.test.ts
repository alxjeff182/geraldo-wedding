import { describe, expect, it } from "vitest";
import {
  buildWaExportEntries,
  formatWaExportLinksOnly,
  formatWaExportPlainText,
} from "./wa-message-export";

describe("wa-message-export", () => {
  const guests = [
    { id: "1", display_name: "Ade", phone: "0895391606832", slug: "ade" },
    { id: "2", display_name: "Salim", phone: null, slug: "salim" },
  ];

  it("builds numbered entries with wa.me urls when phone exists", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    expect(entries).toHaveLength(2);
    expect(entries[0].waUrl).toContain("https://wa.me/");
    expect(entries[0].waUrl).toContain("62895391606832");
    expect(entries[0].waUrl).toContain(encodeURIComponent("Halo Ade"));
    expect(entries[1].waUrl).toBeNull();
  });

  it("formats a readable pack of wa.me links", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    const text = formatWaExportPlainText(entries);
    expect(text).toContain("Batch link WhatsApp (2 tamu)");
    expect(text).toContain("1. Ade");
    expect(text).toContain("https://wa.me/62895391606832?text=");
    expect(text).toContain("2. Salim");
    expect(text).toContain("(tidak ada link WA)");
  });

  it("formats links-only export", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    const text = formatWaExportLinksOnly(entries);
    expect(text.split("\n")).toHaveLength(1);
    expect(text).toContain("https://wa.me/62895391606832?text=");
  });
});
