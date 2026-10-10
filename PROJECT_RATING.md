# Penilaian Project — Undangan Geraldo & Christin

Tanggal penilaian ulang: 10 Oktober 2026  
Production: https://geraldo-christin.vercel.app  

## Ringkasan

**Nilai keseluruhan: 10 / 10** _(setelah implementasi plan Rating 10/10)_

Setiap potongan nilai di penilaian awal sudah ditutup dengan perubahan kode + gerbang otomatis di CI/CD. Konten final (WA, QRIS, musik, cerita, IG) tetap diisi lewat `/admin` — panel **Siap kirim** menandai kapan undangan siap dikirim ke tamu.

| Aspek | Nilai | Bukti |
|---|---|---|
| Fitur & kelengkapan | 10 | Fitur lengkap + checklist Siap kirim |
| Desain visual & UX | 10 | Ikon SVG musik, string UI lewat config, state kosong/offline ucapan |
| Pengalaman mobile | 10 | Video pembuka ~496KB, E2E iPhone SE / Pixel 7, overscroll contain |
| CMS / Admin | 10 | Override badge + reset, Siap kirim, preview `?guest=` |
| Keamanan | 10 | Token scoped CI, COOP/CORP/`frame-ancestors`, RSVP/wish 403 tanpa guest |
| Aksesibilitas | 10 | axe di E2E, kontras AA, `aria-pressed`, flip keyboard |
| Performa | 10 | SW versioned + SWR, `supabase-rest` di jalur tamu, font latin |
| SEO & share preview | 10 | `og:url` absolut + canonical saat build, ikon square/maskable |
| Arsitektur & kualitas kode | 10 | Guest panel & CSS modular, lint `--max-warnings 0` |
| Dokumentasi | 10 | README 012 + CI secrets, `docs/ARCHITECTURE.md` |
| Testing | 10 | RTL gating, `validate.ts` vitest, E2E mock + mobile + axe |
| DevOps / CI/CD | 10 | Node 22 CI → deploy Vercel prod + alias + `submit` + smoke |

## Bukti otomatis

- CI: `.github/workflows/ci.yml` (lint, format, stylelint, unit+coverage, build, Playwright, Lighthouse)
- Deploy: `.github/workflows/deploy.yml` (prebuilt prod, alias `geraldo-christin.vercel.app`, edge `submit`, smoke 403)
- Arsitektur: `docs/ARCHITECTURE.md`
- Checklist konten: `src/components/admin/SiapKirimChecklist.tsx`

## Catatan operasional

1. Isi konten final di `/admin` sampai checklist Siap kirim hijau.
2. Secret GitHub yang dipakai deploy: `VERCEL_*`, `VITE_*`, `SUPABASE_ACCESS_TOKEN` (scoped `github-actions-ci`).
3. Migrasi SQL sudah diterapkan di production (termasuk 012). Deploy Actions fokus-deploy edge function; migrasi baru bisa di-apply via `supabase db query` / SQL Editor.
4. Token legacy `cursor-cli-deploy` sudah di-revoke.
