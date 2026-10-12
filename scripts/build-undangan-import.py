#!/usr/bin/env python3
"""Build CSV + SQL import from Undangan Digital Geraldo.xlsx."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
XLSX = Path("/Users/alex-dat/Downloads/Undangan Digital.xlsx")
OUT_CSV = ROOT / "scripts" / "undangan-digital-geraldo.csv"
OUT_SQL = ROOT / "scripts" / "import-undangan-digital-geraldo.sql"


def slugify(name: str) -> str:
    text = unicodedata.normalize("NFD", name.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:60]
    return text or "tamu"


def normalize_phone(raw: str) -> str | None:
    # Excel often wraps phones with bidi marks / special dashes.
    cleaned = (
        (raw or "")
        .replace("\u202a", "")
        .replace("\u202c", "")
        .replace("\xa0", " ")
        .replace("\u2011", "-")
        .replace("\u2013", "-")
        .replace("\u2014", "-")
    )
    digits = re.sub(r"\D", "", cleaned)
    if not digits:
        return None
    if digits.startswith("0"):
        wa = "62" + digits[1:]
    elif digits.startswith("62"):
        wa = digits
    else:
        wa = digits
    if len(wa) < 10 or len(wa) > 15:
        return None
    return "0" + wa[2:] if wa.startswith("62") else wa


def alloc(base: str, taken: set[str]) -> str:
    slug = base
    n = 2
    while slug in taken:
        slug = f"{base}-{n}"
        n += 1
    taken.add(slug)
    return slug


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    # Prefer Geraldo PIC sheet; fall back to first sheet.
    ws = wb["PIC GERALDO"] if "PIC GERALDO" in wb.sheetnames else wb.active
    guests: list[dict[str, str]] = []
    for row in ws.iter_rows(values_only=True):
        name = str(row[0]).strip() if row[0] else ""
        note = str(row[1]).strip() if row[1] else ""
        phone = str(row[2]).strip() if row[2] else ""
        if not name or name.lower() == "nama undangan":
            continue
        guests.append({"name": name, "note": note, "phone": phone})

    taken: set[str] = set()
    phone_taken: set[str] = set()
    rows: list[dict[str, str | None]] = []
    skipped: list[dict[str, str]] = []

    for guest in guests:
        phone = normalize_phone(guest["phone"])
        phone_key = ("62" + phone[1:]) if phone and phone.startswith("0") else phone
        if phone_key and phone_key in phone_taken:
            skipped.append({**guest, "reason": "dup phone"})
            continue
        if phone_key:
            phone_taken.add(phone_key)
        slug = alloc(slugify(guest["name"]), taken)
        rows.append(
            {
                "slug": slug,
                "display_name": guest["name"],
                "phone": phone,
                "note": guest["note"],
            }
        )

    def csv_cell(value: str | None) -> str:
        text = value or ""
        if any(ch in text for ch in [",", '"', "\n"]):
            return '"' + text.replace('"', '""') + '"'
        return text

    csv_lines = ["slug,display_name,phone,notes"]
    for row in rows:
        csv_lines.append(
            ",".join(
                [
                    csv_cell(str(row["slug"])),
                    csv_cell(str(row["display_name"])),
                    csv_cell(str(row["phone"] or "")),
                    csv_cell(str(row["note"] or "")),
                ]
            )
        )
    OUT_CSV.write_text("\n".join(csv_lines) + "\n", encoding="utf-8")

    values = ",\n".join(
        f"  ({sql_str(str(row['slug']))}, {sql_str(str(row['display_name']))}, "
        f"{sql_str(str(row['phone'])) if row['phone'] else 'null'}, "
        f"{sql_str(str(row['note'])) if row['note'] else 'null'})"
        for row in rows
    )

    sql = f"""-- Import Undangan Digital.xlsx ({len(rows)} tamu)
-- Includes Excel Keterangan → guests.notes
-- Template bawaan daftar tamu: 3. Singkat & Sopan (singkat-sopan)

begin;

alter table guests add column if not exists notes text;

insert into guests (slug, display_name, phone, notes)
values
{values}
on conflict (slug) do update
set
  display_name = excluded.display_name,
  phone = coalesce(excluded.phone, guests.phone),
  notes = excluded.notes;

update site_content
set content = jsonb_set(
  coalesce(content, '{{}}'::jsonb),
  '{{invite,defaultTemplateId}}',
  to_jsonb('singkat-sopan'::text),
  true
)
where id = 'main';

commit;

select count(*) as guest_count from guests;
select count(*) filter (where notes is not null and notes <> '') as with_notes from guests;
select content #>> '{{invite,defaultTemplateId}}' as default_template
from site_content
where id = 'main';
"""
    OUT_SQL.write_text(sql, encoding="utf-8")

    dest_xlsx = ROOT / "scripts" / "Undangan Digital.xlsx"
    dest_xlsx.write_bytes(XLSX.read_bytes())

    print(
        json.dumps(
            {
                "imported": len(rows),
                "skipped": skipped,
                "csv": str(OUT_CSV),
                "sql": str(OUT_SQL),
                "sample": rows[:3],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
