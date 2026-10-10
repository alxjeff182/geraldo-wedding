# Penilaian Project — Undangan Geraldo & Christin

Tanggal penilaian: 10 Oktober 2026
Production: https://geraldo-christin.vercel.app
Commit terakhir yang dinilai: `43d9d31`

## Ringkasan

**Nilai keseluruhan: 8.4 / 10** *(post Rating 10/10 plan — evidence: CI/deploy workflows, supabase-rest guest path, validate tests, Playwright+axe, Lighthouse gate; konten final tamu masih TBD)*

Sebagai produk, undangan ini sudah matang: fitur lengkap, tampilan ballroom yang konsisten, CMS yang bisa dipakai tanpa menyentuh kode, dan keamanan backend yang di atas rata-rata untuk undangan digital. Nilai tertahan oleh sisi engineering di belakang layar: CI merah di semua push terakhir, beberapa file yang terlalu besar, cakupan tes yang tipis di area paling penting, dan dua detail PWA/SEO yang belum benar.

| Aspek | Nilai |
|---|---|
| Fitur & kelengkapan | 9.0 |
| Desain visual & UX | 8.5 |
| Pengalaman mobile | 8.5 |
| CMS / Admin | 8.5 |
| Keamanan | 8.5 |
| Aksesibilitas | 8.0 *(target 8.5 — axe e2e, contrast bumps; bukti: `.github/workflows/ci.yml`)* |
| Performa | 8.0 *(target 8.5 — SW versioning, opening video compress, latin font subsets)* |
| SEO & share preview | 8.5 *(canonical/og:url build gate, icons/manifest)* |
| Arsitektur & kualitas kode | 8.0 *(supabase-rest vs admin client, validate extract)* |
| Dokumentasi | 8.0 *(README 012, `docs/ARCHITECTURE.md`)* |
| Testing | 7.5 *(RsvpSheet/Wishes RTL, submit validate vitest, e2e mocks)* |
| DevOps / CI/CD | 8.5 *(Node 22 CI, deploy workflow, Vercel git deploy off)* |

---

## 1. Fitur & kelengkapan — 9.0

Yang sudah ada:
- Cover, video pembuka, hero scroll-frame dengan countdown.
- Kartu mempelai (flip) dengan nama lengkap dan Instagram.
- Ayat, detail acara per venue, Maps, kalender per acara, simpan semua acara, unduh `.ics`.
- Galeri 3D ring dengan lightbox, swipe, dan tombol back untuk menutup.
- Hadiah lewat QRIS, multi rekening, salin nomor, salin alamat, dan konfirmasi WhatsApp.
- Our Story, info tamu (dress code, parkir), hashtag yang bisa disalin dan link ke Instagram.
- RSVP (Hadir / Berhalangan / Ragu, batas waktu, kunci tanpa link pribadi).
- Ucapan dengan batas 3 per tamu, moderasi, dan refresh berkala.
- Musik dengan tombol mute (otomatis tersembunyi kalau belum ada file musik).

Pengurang:
- Konten final belum diisi (WA, QRIS, musik, cerita). Ini disengaja, tapi tetap berarti produk belum siap dikirim ke tamu.

## 2. Desain visual & UX — 8.5

Kuat:
- Identitas visual ballroom (maroon, emas, tipografi display) konsisten dari cover sampai footer.
- Interaksi terasa premium: flip kartu, ring galeri, sheet yang bisa di-swipe dan ditutup dengan back.
- Dock aksi (RSVP / Lokasi / Hadiah) muncul lebih cepat setelah `DOCK_AT` diturunkan ke 0.3.

Pengurang:
- Ikon musik memakai emoji (`♪` / `🔇`), yang tampil berbeda di tiap OS dan tidak serasi dengan ikon SVG lain.
- Beberapa teks UI masih hardcoded di komponen ("Simpan ke Kalender", "Lihat di Instagram"), jadi tidak bisa diubah dari CMS seperti teks lainnya.
- Toast saat menyalin hashtag memakai pesan "salin rekening" (`copyAccountSuccess`).

## 3. Pengalaman mobile — 8.5

Kuat:
- Layout memakai container query dan `safe-area-inset`.
- Swipe-to-dismiss sudah diperbaiki dengan `touch-action: pan-y`.
- Ukuran foto galeri sekarang dihitung dari tinggi dan lebar stage, jadi tidak lagi menabrak caption di layar pendek.

Pengurang:
- `opening.mp4` berukuran 4.1 MB dan diputar di awal. Di jaringan seluler yang lambat, ini jeda pertama yang dirasakan tamu.

## 4. CMS / Admin — 8.5

Kuat:
- Hampir semua konten bisa diubah dari `/admin`: mempelai, acara (tambah/hapus), galeri (tambah/hapus/urutkan), rekening (multi), media termasuk hero poster, template WhatsApp, `site.url`, dan `noIndex`.
- Manajemen tamu lengkap: import CSV, link pribadi, status sudah dikirim, moderasi ucapan, daftar RSVP dengan filter dan export CSV.

Pengurang:
- `GuestInvitePanel.tsx` sudah 1.103 baris. Sulit dirawat dan rawan bug saat ditambah fitur.
- Override CMS bisa diam-diam mengalahkan default di config (contoh: story yang tetap mati meski default-nya sudah `true`). Tidak ada indikator di admin bahwa sebuah field sedang di-override.

## 5. Keamanan — 8.5

Kuat:
- Header ketat di `vercel.json`: CSP tanpa `unsafe-eval` dan tanpa script pihak ketiga, HSTS preload, `X-Frame-Options: DENY`, dan Permissions-Policy.
- 40 pernyataan RLS / policy di migrasi Supabase.
- Edge function `submit` memeriksa origin, rate limit per IP, honeypot, timing form, filter spam (link, nomor HP, kata kasar), dan duplikasi.
- Undangan ketat: RSVP dan ucapan wajib `guest_id` yang terdaftar, sudah diverifikasi di production (HTTP 403 tanpa link pribadi). `ensure_guest_by_slug` sudah dicabut dari `PUBLIC`, `anon`, dan `authenticated`.

Pengurang:
- Token Supabase `cursor-cli-deploy` yang dibuat untuk deploy adalah token **legacy dengan akses penuh** ke akun. Harus di-revoke.
- CSP masih mengizinkan `style-src 'unsafe-inline'`. Risikonya kecil, tapi bisa diperketat.
- Migrasi 012 versi pertama tidak efektif karena lupa mencabut `PUBLIC`. Sudah diperbaiki, tapi ini menunjukkan tidak ada tes otomatis untuk hak akses database.

## 6. Aksesibilitas — 7.0

Kuat:
- Sekitar 105 atribut `aria-*` di tema, dialog dengan `role="dialog"` dan `aria-modal`, `inert` untuk konten di belakang sheet.
- `prefers-reduced-motion` dihormati di 6 tempat.
- Teks alternatif foto dan label tombol navigasi tersedia.

Pengurang:
- Tombol musik berbasis emoji, dan `aria-label`-nya tidak mencerminkan state dengan `aria-pressed`.
- Hashtag yang bisa disalin tidak memberi petunjuk ke screen reader bahwa ia akan menyalin.
- Belum ada audit otomatis (misalnya axe di Playwright), jadi kontras emas di atas maroon untuk teks kecil belum terverifikasi.

## 7. Performa — 7.0

Ukuran bundle (gzip): entry sekitar 66 KB, Supabase 55 KB, motion 45 KB, BallroomApp 21 KB, CSS tema 12 KB. Total aset tema 7.7 MB, terbesar `opening.mp4` (4.1 MB), galeri 1.7 MB, hero frames 0.9 MB.

Kuat:
- Code-splitting: admin dan tema dimuat terpisah.
- Hero frames dan galeri sudah dikompres.

Pengurang:
- Video pembuka 4.1 MB adalah biaya terbesar di first load.
- Bundle Supabase (55 KB) dimuat untuk semua tamu, padahal di halaman tamu hanya dipakai untuk lookup tamu, ucapan, dan submit.
- **Bug service worker:** `CACHE_NAME` statis (`geraldo-wedding-v1`) dan `/assets/ballroom/*` di-cache-first. File di folder ini tidak punya hash di nama file. Kalau foto diganti dengan nama yang sama (misalnya `gallery/01.jpg`), tamu yang pernah membuka undangan akan terus melihat foto lama. Plan meminta versi cache dari hash build, dan itu belum diterapkan.
- Ucapan di-refresh tiap 30 detik meski section tidak terlihat atau tab di background. Plan meminta polling hanya saat section terlihat.

## 8. SEO & share preview — 7.0

Kuat:
- `og:image` absolut, Twitter card, JSON-LD dengan 2 `Event` (Pemberkatan dan Resepsi), `noindex` untuk `/admin`.

Pengurang:
- **`og:url` di `index.html` bernilai `/` (relatif).** Crawler WhatsApp dan Facebook tidak menjalankan JavaScript, jadi koreksi dari `usePageMeta` tidak terbaca. Nilai ini seharusnya URL absolut.
- `apple-touch-icon` memakai `cover-frame.jpg` (bukan ikon persegi), jadi hasilnya terpotong di home screen iOS.

## 9. Arsitektur & kualitas kode — 7.0

Kuat:
- TypeScript dengan hampir tanpa `any` atau `@ts-ignore` (hanya 1 pengecualian).
- Pemisahan yang jelas: `config` sebagai default, CMS sebagai override lewat `mergeWeddingContent`, hooks untuk perilaku (`useSheet`, `useGalleryRing`, `useHistoryDismiss`), dan `lib` untuk logika murni.
- Lint bersih (0 error, 2 warning).

Pengurang:
- File terlalu besar: `ballroom.css` 2.666 baris, `admin.css` 2.062 baris, `GuestInvitePanel.tsx` 1.103 baris.
- `ballroom.css` bagian awal berformat padat (`}.theme-ballroom .x{` tanpa baris kosong), jadi sulit dibaca dan di-diff.
- Banyak string konten dioper satu-satu sebagai props dari `BallroomApp` (misalnya GiftHub menerima belasan props teks), padahal komponen bisa membaca `useWeddingContent()` langsung seperti yang sudah dilakukan `RsvpSheet`.

## 10. Dokumentasi — 7.0

Kuat:
- README 178 baris yang mencakup quick start, setup Supabase, CMS, template WhatsApp, deploy, checklist pre-deploy, testing, troubleshooting, catatan keamanan, dan struktur project.
- Aturan deploy di `.cursor/rules` jelas.

Pengurang:
- README masih menyebut migrasi sampai 011, dan belum menjelaskan kebijakan undangan ketat (slug yang tidak terdaftar tidak lagi membuat tamu otomatis).

## 11. Testing — 5.5

Kuat:
- 61 unit test lulus di 15 file, mencakup calendar links, merge konten, guard ucapan, anti-spam RSVP, bulk tamu, link undangan, dan deadline.
- 3 spec E2E Playwright, termasuk tes baru bahwa link umum mengunci RSVP.

Pengurang:
- `invite-gating.test.ts` hanya menguji `Boolean(guestId)` pada variabel lokal. Tes ini tidak menyentuh komponen `RsvpSheet` atau `Wishes`, jadi tidak akan gagal kalau gating di komponen rusak.
- Tidak ada tes untuk edge function `submit`, padahal ini lapisan keamanan utama.
- Tidak ada tes untuk hak akses database (bug `PUBLIC` di migrasi 012 lolos karena ini).
- E2E bergantung pada tamu `keluarga-tampubolon` yang harus ada di database production.

## 12. DevOps / CI/CD — 5.0

Kuat:
- Deploy ke Vercel dan alias production berjalan lancar, dan header keamanan dikelola sebagai kode.
- Migrasi SQL bernomor, dengan skrip `apply-migrations` dan `verify-migrations`.

Pengurang:
- **CI GitHub merah di 6 push terakhir** dan gagal di langkah `npm ci`. Penyebabnya:
  - `package-lock.json` tidak sinkron dengan `package.json` (`@emnapi/core` dan `@emnapi/runtime` hilang dari lock file);
  - workflow memakai Node 20, sedangkan `@supabase/supabase-js@2.110.2` meminta Node 22 ke atas.

  Akibatnya, lint, test, build, dan E2E tidak pernah berjalan di CI, dan semua deploy terakhir tidak punya gerbang otomatis.
- Deploy production lewat CLI dari mesin lokal plus alias manual, bukan dari CI.
- Edge function dan migrasi di-deploy manual dengan token pribadi.

---

## Prioritas perbaikan

| # | Perbaikan | Dampak | Usaha |
|---|---|---|---|
| 1 | Revoke token Supabase `cursor-cli-deploy` | Keamanan akun | 1 menit |
| 2 | Perbaiki CI: `npm install` untuk sinkronkan lock file, naikkan Node di workflow ke 22 | Semua gerbang kualitas aktif lagi | 10 menit |
| 3 | Versi cache service worker dari hash build, atau ubah `/assets/ballroom/*` jadi stale-while-revalidate | Tamu tidak tertahan di foto lama setelah diganti | 30 menit |
| 4 | `og:url` absolut di `index.html` | Preview WhatsApp/Facebook benar | 5 menit |
| 5 | Isi konten final lewat `/admin` (WA, QRIS, musik, cerita, IG) | Siap dikirim ke tamu | Tergantung data |
| 6 | Kompres `opening.mp4` (target di bawah 1.5 MB) atau tambahkan versi ringan untuk mobile | First load lebih cepat | 30 menit |
| 7 | Tes komponen nyata untuk gating RSVP/Ucapan dan tes untuk edge function `submit` | Regresi keamanan tertangkap | 2–3 jam |
| 8 | Polling ucapan hanya saat section terlihat dan tab aktif | Hemat baterai dan kuota Supabase | 20 menit |
| 9 | Ganti ikon musik emoji dengan SVG plus `aria-pressed`; pindahkan teks hardcoded ke config | Konsistensi visual dan CMS | 30 menit |
| 10 | Pecah `GuestInvitePanel.tsx` dan rapikan format `ballroom.css` | Perawatan jangka panjang | 2–4 jam |

Dengan perbaikan nomor 1–4 saja, nilai DevOps naik ke sekitar 7.5, Performa dan SEO ke sekitar 8, dan nilai keseluruhan menjadi sekitar **8.2 / 10**.
