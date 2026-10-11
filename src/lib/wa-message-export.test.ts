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
    { id: "3", display_name: "Alfian", phone: "082142803753", slug: "alfian" },
  ];

  it("builds numbered entries with wa.me urls when phone exists", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    expect(entries).toHaveLength(3);
    expect(entries[0].waUrl).toContain("https://wa.me/");
    expect(entries[0].waUrl).toContain("62895391606832");
    expect(entries[0].waUrl).toContain(encodeURIComponent("Halo Ade"));
    expect(entries[1].waUrl).toBeNull();
  });

  it("formats a WhatsApp-safe pack with blank gaps between links", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    const text = formatWaExportPlainText(entries);
    expect(text).toContain("1. Ade\nhttps://wa.me/62895391606832?text=");
    expect(text).toContain("3. Alfian\nhttps://wa.me/");
    expect(text).not.toContain("Salim");
    const blocks = text.trim().split(/\n{3,}/);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].startsWith("1. Ade\nhttps://wa.me/")).toBe(true);
    expect(blocks[1].startsWith("3. Alfian\nhttps://wa.me/")).toBe(true);
  });

  it("formats links-only export with blank gaps", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    const text = formatWaExportLinksOnly(entries);
    const parts = text.trim().split(/\n{3,}/);
    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain("https://wa.me/62895391606832?text=");
    expect(parts[1]).toContain("https://wa.me/6282142803753?text=");
  });
});
