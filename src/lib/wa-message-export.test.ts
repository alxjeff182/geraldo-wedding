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

  it("builds short chat urls plus prefilled wa urls when phone exists", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    expect(entries).toHaveLength(3);
    expect(entries[0].chatUrl).toBe("https://wa.me/62895391606832");
    expect(entries[0].waUrl).toContain("https://wa.me/62895391606832?text=");
    expect(entries[0].waUrl).toContain(encodeURIComponent("Halo Ade"));
    expect(entries[1].chatUrl).toBeNull();
    expect(entries[1].waUrl).toBeNull();
  });

  it("formats pack with short links and plain messages (no encoded ?text=)", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    const text = formatWaExportPlainText(entries);
    expect(text).toContain("1. Ade\n0895391606832\nhttps://wa.me/62895391606832\n\nHalo Ade");
    expect(text).toContain("3. Alfian\n082142803753\nhttps://wa.me/6282142803753\n\nHalo Alfian");
    expect(text).not.toContain("?text=");
    expect(text).not.toContain("%20");
    expect(text).not.toContain("Salim");
    expect(text).toContain("———");
  });

  it("formats short links-only export", () => {
    const entries = buildWaExportEntries(guests, (g) => `Halo ${g.display_name}`);
    const text = formatWaExportLinksOnly(entries);
    expect(text).toBe(
      "1. Ade\nhttps://wa.me/62895391606832\n\n3. Alfian\nhttps://wa.me/6282142803753\n",
    );
    expect(text).not.toContain("?text=");
  });
});
