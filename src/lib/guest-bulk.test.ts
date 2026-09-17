import { describe, expect, it } from "vitest";
import {
  bulkRowsReady,
  normalizeBulkPhone,
  parseGuestBulkCsv,
  parseGuestBulkText,
} from "./guest-bulk";

describe("guest-bulk", () => {
  it("parses comma-separated paste lines", () => {
    const rows = parseGuestBulkText("Budi Santoso, 081234567802\nSiti Rahayu,081234567803");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      display_name: "Budi Santoso",
      phone: "081234567802",
      slug: "budi-santoso",
      ok: true,
    });
    expect(rows[1].slug).toBe("siti-rahayu");
  });

  it("parses tab and pipe separators", () => {
    const tab = parseGuestBulkText("Andi Wijaya\t081234567804");
    expect(tab[0]).toMatchObject({ display_name: "Andi Wijaya", phone: "081234567804", ok: true });

    const pipe = parseGuestBulkText("Maya Kartika | 0812-3456-7809");
    expect(pipe[0].ok).toBe(true);
    expect(pipe[0].phone).toBe("081234567809");
  });

  it("allows name-only rows", () => {
    const rows = parseGuestBulkText("Keluarga Santoso");
    expect(rows[0]).toMatchObject({
      display_name: "Keluarga Santoso",
      phone: null,
      slug: "keluarga-santoso",
      ok: true,
    });
  });

  it("skips empty lines and marks invalid phone", () => {
    const rows = parseGuestBulkText("\nBudi, abc\n\nSiti, 081234567803\n");
    expect(rows).toHaveLength(2);
    expect(rows[0].ok).toBe(false);
    expect(rows[0].error).toMatch(/Nomor/);
    expect(rows[1].ok).toBe(true);
  });

  it("flags duplicate slugs in batch and against existing", () => {
    const rows = parseGuestBulkText(
      "Budi Santoso, 081234567801\nBudi Santoso, 081234567802\nAndi Wijaya, 081234567803",
      { existingSlugs: ["andi-wijaya"] },
    );
    expect(rows[0].ok).toBe(true);
    expect(rows[1].ok).toBe(false);
    expect(rows[1].error).toMatch(/Duplikat/);
    expect(rows[2].ok).toBe(false);
    expect(rows[2].error).toMatch(/sudah ada/);
  });

  it("parses CSV with header and optional slug column", () => {
    const csv = [
      "slug,display_name,phone",
      "ignored,Jeffry & Istri,081234567801",
      "x,Budi Santoso,081234567802",
    ].join("\n");
    const rows = parseGuestBulkCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].slug).toBe("jeffry-istri");
    expect(rows[1].display_name).toBe("Budi Santoso");
  });

  it("parses CSV with Indonesian headers", () => {
    const rows = parseGuestBulkCsv("nama,nomor\nPutri Lestari,081234567805");
    expect(rows[0]).toMatchObject({
      display_name: "Putri Lestari",
      phone: "081234567805",
      slug: "putri-lestari",
      ok: true,
    });
  });

  it("normalizes phones and filters ready rows", () => {
    expect(normalizeBulkPhone("+62 812-3456-7890")).toBe("081234567890");
    expect(normalizeBulkPhone("6281234567890")).toBe("081234567890");
    const rows = parseGuestBulkText("A, 081234567801\n, 0812\nB, bad");
    expect(bulkRowsReady(rows)).toHaveLength(1);
  });
});
