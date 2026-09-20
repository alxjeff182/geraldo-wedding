import { normalizePhoneForWhatsApp, slugifyGuestName } from "./invite-links";

export type BulkGuestRow = {
  line: number;
  display_name: string;
  phone: string | null;
  slug: string;
  ok: boolean;
  error?: string;
};

export type ParseGuestBulkOptions = {
  /** Used only to allocate unique invite slugs when names collide. */
  existingSlugs?: ReadonlySet<string> | readonly string[];
  /** Uniqueness is enforced by normalized phone (WA), not by name. */
  existingPhones?: ReadonlySet<string> | readonly string[];
};

const HEADER_RE = /^(slug|display_name|nama|name|phone|nomor|wa)([,;\t| ]|$)/i;

function toLowerSet(existing?: ReadonlySet<string> | readonly string[]): Set<string> {
  if (!existing) return new Set();
  const list = existing instanceof Set ? [...existing] : [...existing];
  return new Set(list.map((s) => s.toLowerCase()).filter(Boolean));
}

/** Keep display-friendly local digits (08…); reject numbers that cannot be WA’d. */
export function normalizeBulkPhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const wa = normalizePhoneForWhatsApp(trimmed);
  if (!wa || wa.length < 10 || wa.length > 15) return null;
  if (wa.startsWith("62")) return `0${wa.slice(2)}`;
  return wa;
}

/** Canonical key for phone uniqueness (62…). */
export function phoneUniquenessKey(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const wa = normalizePhoneForWhatsApp(raw);
  if (!wa || wa.length < 10 || wa.length > 15) return null;
  return wa;
}

export function allocateUniqueSlug(base: string, taken: Set<string>): string {
  const root = (base || "tamu").toLowerCase();
  let slug = root;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  taken.add(slug);
  return slug;
}

function splitLine(line: string): string[] {
  if (line.includes("\t")) return line.split("\t").map((p) => p.trim());
  if (line.includes("|")) return line.split("|").map((p) => p.trim());
  if (line.includes(";")) return line.split(";").map((p) => p.trim());

  const parts = line.split(",").map((p) => p.trim());
  if (parts.length === 1) return [parts[0] ?? ""];
  if (parts.length === 2) return [parts[0] ?? "", parts[1] ?? ""];

  // Name may contain commas: last segment is phone when numeric enough (or empty)
  const last = parts[parts.length - 1] ?? "";
  const lastDigits = last.replace(/\D/g, "");
  if (!last || lastDigits.length >= 8) {
    return [parts.slice(0, -1).join(", "), last];
  }
  return [line.trim()];
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === "," || ch === ";" || ch === "\t") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function mapHeaderIndexes(headerCells: string[]): {
  nameIdx: number;
  phoneIdx: number;
  slugIdx: number;
} {
  const lower = headerCells.map((c) => c.trim().toLowerCase());
  const nameIdx = lower.findIndex((c) =>
    ["display_name", "nama", "name", "nama_tamu", "guest"].includes(c),
  );
  const phoneIdx = lower.findIndex((c) =>
    ["phone", "nomor", "wa", "whatsapp", "no_wa", "no.whatsapp", "hp"].includes(c),
  );
  const slugIdx = lower.findIndex((c) => c === "slug");
  return {
    nameIdx: nameIdx >= 0 ? nameIdx : 0,
    phoneIdx: phoneIdx >= 0 ? phoneIdx : nameIdx >= 0 ? (nameIdx === 0 ? 1 : 0) : 1,
    slugIdx,
  };
}

function finalizeRows(
  drafts: Array<{ line: number; display_name: string; phoneRaw: string }>,
  existingSlugs: Set<string>,
  existingPhones: Set<string>,
): BulkGuestRow[] {
  const seenPhones = new Set<string>();
  const takenSlugs = new Set(existingSlugs);
  const rows: BulkGuestRow[] = [];

  for (const draft of drafts) {
    const display_name = draft.display_name.trim();
    if (!display_name) {
      rows.push({
        line: draft.line,
        display_name: "",
        phone: null,
        slug: "",
        ok: false,
        error: "Nama kosong",
      });
      continue;
    }

    const phoneRaw = draft.phoneRaw.trim();
    let phone: string | null = null;
    let phoneKey: string | null = null;

    if (phoneRaw) {
      phone = normalizeBulkPhone(phoneRaw);
      phoneKey = phoneUniquenessKey(phoneRaw);
      if (!phone || !phoneKey) {
        rows.push({
          line: draft.line,
          display_name,
          phone: null,
          slug: slugifyGuestName(display_name),
          ok: false,
          error: "Nomor WA tidak valid",
        });
        continue;
      }

      if (existingPhones.has(phoneKey) || seenPhones.has(phoneKey)) {
        rows.push({
          line: draft.line,
          display_name,
          phone,
          slug: slugifyGuestName(display_name),
          ok: false,
          error: existingPhones.has(phoneKey)
            ? "Nomor WA sudah ada di daftar"
            : "Duplikat nomor dalam batch",
        });
        continue;
      }

      seenPhones.add(phoneKey);
    }

    const slug = allocateUniqueSlug(slugifyGuestName(display_name), takenSlugs);
    rows.push({
      line: draft.line,
      display_name,
      phone,
      slug,
      ok: true,
    });
  }

  return rows;
}

export function parseGuestBulkText(
  raw: string,
  options: ParseGuestBulkOptions = {},
): BulkGuestRow[] {
  const existingSlugs = toLowerSet(options.existingSlugs);
  const existingPhones = toLowerSet(options.existingPhones);
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const drafts: Array<{ line: number; display_name: string; phoneRaw: string }> = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (idx === 0 && HEADER_RE.test(trimmed) && /display_name|nama|name|phone|slug/i.test(trimmed)) {
      return;
    }

    const parts = splitLine(trimmed);
    const display_name = parts[0] ?? "";
    const phoneRaw = parts[1] ?? "";
    drafts.push({ line: idx + 1, display_name, phoneRaw });
  });

  return finalizeRows(drafts, existingSlugs, existingPhones);
}

export function parseGuestBulkCsv(
  raw: string,
  options: ParseGuestBulkOptions = {},
): BulkGuestRow[] {
  const existingSlugs = toLowerSet(options.existingSlugs);
  const existingPhones = toLowerSet(options.existingPhones);
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length === 0) return [];

  let start = 0;
  let nameIdx = 0;
  let phoneIdx = 1;

  const first = lines[0]?.trim() ?? "";
  if (first && /display_name|nama|name|phone|slug|nomor/i.test(first)) {
    const header = parseCsvLine(first);
    const mapped = mapHeaderIndexes(header);
    nameIdx = mapped.nameIdx;
    phoneIdx = mapped.phoneIdx;
    start = 1;
  }

  const drafts: Array<{ line: number; display_name: string; phoneRaw: string }> = [];

  for (let i = start; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    const cells = parseCsvLine(trimmed);
    drafts.push({
      line: i + 1,
      display_name: cells[nameIdx] ?? "",
      phoneRaw: cells[phoneIdx] ?? "",
    });
  }

  return finalizeRows(drafts, existingSlugs, existingPhones);
}

export function bulkRowsReady(rows: readonly BulkGuestRow[]): BulkGuestRow[] {
  return rows.filter((r) => r.ok);
}
