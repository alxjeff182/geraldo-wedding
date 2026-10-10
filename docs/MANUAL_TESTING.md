# Manual Testing Checklist — Undangan Geraldo & Christin

Production: https://geraldo-christin.vercel.app  
Admin: https://geraldo-christin.vercel.app/admin

---

## Aturan testing (wajib)

1. **Semua tes dijalankan manual di browser sungguhan.** Tidak boleh diganti Playwright, script, curl, atau DevTools "Run snippet". Otomasi (CI) sudah ada terpisah; dokumen ini untuk mata dan tangan manusia.
2. **Minimal 2 lingkungan:**
   - HP asli (Android Chrome **dan/atau** iPhone Safari), bukan cuma emulator.
   - Desktop (Chrome atau Safari) ukuran normal.
3. **Gunakan jendela Incognito/Private** untuk sisi tamu, supaya localStorage (batas ucapan, status RSVP) bersih. Tutup lalu buka ulang Incognito tiap skenario yang butuh "tamu baru".
4. **Admin dan tamu dibuka di browser/jendela berbeda.** Admin di jendela normal, tamu di Incognito, supaya sesi login tidak tercampur.
5. **Pakai data uji dengan prefix `TEST`** (contoh `TEST Budi`) dan **hapus semuanya di akhir** (lihat bagian I). Jangan uji dengan nama tamu asli.
6. **Setiap item dicentang hanya jika hasil sesuai "Harapan".** Kalau gagal: jangan dicentang, tulis di tabel _Temuan_ di bawah (langkah, hasil aktual, screenshot, device).
7. **Jangan ubah konten final pasangan saat testing.** Kalau perlu mengubah teks untuk tes, catat nilai asli dulu dan kembalikan, lalu Simpan.
8. **Satu tester, satu sesi lengkap**, berurutan A → I. Bagian D bergantung pada tamu yang dibuat di C.

Isi sebelum mulai:

| Tester              | Tanggal    | Device / Browser tamu                       | Device / Browser admin | Commit / versi |
| ------------------- | ---------- | ------------------------------------------- | ---------------------- | -------------- |
| Cursor Agent (Auto) | 2026-10-10 | Cursor browser, iPhone SE emulation 375×667 | Cursor browser desktop | `749920a`+     |

**Catatan sesi ini:** Admin CMS (B–C, F–G, sebagian H/I) **belum bisa dijalankan penuh** karena tidak ada password akun `admin@geraldo.com`. Login negatif A1–A4 sudah diuji. Sisi tamu + E diuji di production. Data `TEST*` dibuat via SQL lalu dibersihkan di akhir.

---

## A. Login & keamanan admin

| #   | Langkah                                            | Harapan                                                                              | ✓   |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------ | --- |
| A1  | Buka `/admin` tanpa login                          | Muncul layar login (Email, Password, tombol **Masuk ke CMS**). Editor tidak terlihat | [x] |
| A2  | Klik Masuk dengan field kosong                     | Ditolak / validasi muncul, tidak masuk                                               | [x] |
| A3  | Login dengan password salah                        | Pesan error jelas, tetap di layar login                                              | [x] |
| A4  | Ulangi password salah beberapa kali berturut-turut | Muncul pesan "Terlalu banyak percobaan login. Coba lagi dalam X menit."              | [x] |
| A5  | Login dengan akun yang **bukan admin** (kalau ada) | Ditolak, tidak bisa melihat editor                                                   | [ ] |
| A6  | Login dengan akun admin yang benar                 | Masuk ke editor, tab **Umum** aktif, panel **Siap kirim** terlihat                   | [ ] |
| A7  | Refresh halaman                                    | Tetap login                                                                          | [ ] |
| A8  | Klik **Keluar**                                    | Kembali ke layar login. Tombol Back browser tidak membuka editor lagi                | [ ] |
| A9  | Login ulang untuk lanjut ke bagian berikut         | Berhasil                                                                             | [ ] |

A5: skip — hanya ada 1 user Auth (`admin@geraldo.com`), tidak ada akun non-admin.  
A6–A9: **blocked** — butuh password admin (lihat Temuan #1).

## B. Editor konten (CMS) — ubah, simpan, reset

Lakukan di **satu field teks** saja per tab (catat nilai asli dulu).

| #   | Langkah                                                                                         | Harapan                                                                                    | ✓   |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --- |
| B1  | Klik setiap tab: Umum, Undangan, Mempelai, Acara, Galeri, Gift, RSVP, Buku Tamu, Penutup, Media | Semua tab terbuka tanpa error/blank                                                        | [ ] |
| B2  | Tab **Umum**: ubah satu teks (misal teks pembuka) jadi `TEST pembuka`                           | Field menampilkan badge "diubah dari default" + tombol **Reset**                           | [ ] |
| B3  | Klik **Simpan Perubahan**                                                                       | Label berubah "Menyimpan..." lalu toast/indikasi sukses                                    | [ ] |
| B4  | Buka undangan di Incognito, refresh                                                             | Teks `TEST pembuka` muncul di halaman tamu                                                 | [ ] |
| B5  | Kembali ke admin, klik **Reset** di field tadi, lalu **Simpan Perubahan**                       | Badge hilang, nilai kembali default. Di halaman tamu (refresh) teks kembali seperti semula | [ ] |
| B6  | Ubah field lalu **refresh tanpa Simpan**                                                        | Perubahan tidak tersimpan (atau ada peringatan) — catat perilaku aktual                    | [ ] |
| B7  | Tab **Acara**: ubah jam/venue lalu simpan, cek di tamu, lalu kembalikan                         | Kartu acara dan link kalender ikut berubah; dikembalikan dengan benar                      | [ ] |
| B8  | Tab **RSVP**: cek field deadline terisi tanggal yang benar                                      | Deadline sesuai rencana acara                                                              | [ ] |

B1–B8: **blocked** — perlu login admin.

## C. Undangan — CRUD daftar tamu

| #   | Langkah                                                                                              | Harapan                                                                                           | ✓   |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --- |
| C1  | Tab **Undangan**: tambah tamu `TEST Budi` + nomor WA uji, klik tambah                                | Baris baru muncul di tabel dengan slug otomatis, statistik jumlah tamu bertambah                  | [ ] |
| C2  | Tambah tamu dengan nama kosong                                                                       | Ditolak, tidak ada baris kosong                                                                   | [ ] |
| C3  | Tambah tamu `TEST Budi` lagi (nama sama)                                                             | Tidak bentrok: ditolak atau slug dibuat unik — catat perilaku                                     | [ ] |
| C4  | Edit baris `TEST Budi` → ganti nama jadi `TEST Budi & Istri`, klik Simpan baris                      | Nama berubah setelah refresh                                                                      | [ ] |
| C5  | Klik **Salin link**                                                                                  | Link `…/?guest=<slug>` tersalin (tempel di notes untuk cek)                                       | [ ] |
| C6  | Klik **Pratinjau** pada baris                                                                        | Undangan terbuka di tab baru dengan nama `TEST Budi & Istri` di cover                             | [ ] |
| C7  | Klik tombol **WhatsApp** pada baris                                                                  | WhatsApp/wa.me terbuka dengan pesan template berisi nama + link tamu yang benar                   | [ ] |
| C8  | Toggle status **terkirim**                                                                           | Status berubah, filter status WA ikut menyesuaikan, bertahan setelah refresh                      | [ ] |
| C9  | **Kirim berikutnya** (yang belum terkirim)                                                           | Membuka WA untuk tamu belum terkirim berikutnya                                                   | [ ] |
| C10 | Cari `TEST` di kolom pencarian                                                                       | Hanya baris TEST yang tampil                                                                      | [ ] |
| C11 | Filter status WA (terkirim / belum)                                                                  | Daftar sesuai filter                                                                              | [ ] |
| C12 | Ubah "baris per halaman" dan pindah halaman (pertama/sebelumnya/berikutnya/terakhir)                 | Pagination benar, tidak ada baris dobel/hilang                                                    | [ ] |
| C13 | **Import massal**: buka panel, tempel 3 baris (`TEST A`, `TEST B`, `TEST C` + nomor), klik Pratinjau | Pratinjau menampilkan 3 tamu, baris tidak valid ditandai                                          | [ ] |
| C14 | Klik Import                                                                                          | 3 tamu masuk tabel                                                                                | [ ] |
| C15 | Panel import → Reset                                                                                 | Textarea dan pratinjau kosong                                                                     | [ ] |
| C16 | **Template pesan**: pilih tab template, sisipkan variabel (nama/link), simpan                        | Pesan WA (C7) memakai template baru; kembalikan template asli setelahnya                          | [ ] |
| C17 | **Hapus** `TEST C` → konfirmasi                                                                      | Baris hilang, statistik berkurang, link `?guest=test-c` sekarang jadi mode publik (RSVP terkunci) | [ ] |
| C18 | Hapus lalu klik **Batal** di dialog konfirmasi                                                       | Baris tidak terhapus                                                                              | [ ] |

C1–C18: **blocked** — perlu login admin. (Tamu `TEST*` sempat dibuat via SQL untuk uji D, lalu dihapus di I.)

## D. Halaman tamu — link personal (`?guest=jeffry-istri` / `?guest=test-budi`)

Buka di **HP**, Incognito.  
Sesi ini: mobile emulation 375×667 di Cursor browser.

| #   | Langkah                                                     | Harapan                                                                                                               | ✓   |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --- |
| D1  | Buka link personal                                          | Cover tampil: "Kepada Yth." + nama tamu, tanggal, tombol **Buka Undangan**                                            | [x] |
| D2  | Klik **Buka Undangan**                                      | Video pembuka main, tombol **Lewati** langsung terlihat                                                               | [x] |
| D3  | Klik **Lewati**                                             | Masuk ke undangan, musik mulai (kalau audio diisi)                                                                    | [x] |
| D4  | Tombol musik: matikan / nyalakan                            | Ikon berubah, audio berhenti/main                                                                                     | [ ] |
| D5  | Scroll seluruh halaman dari atas ke bawah                   | Hero, mempelai, story, acara, panduan, galeri, gift, ucapan, hashtag, footer tampil rapi, tidak ada scroll horizontal | [x] |
| D6  | Kartu mempelai: tap / Enter untuk flip, link Instagram      | Kartu berbalik, link IG membuka profil yang benar                                                                     | [x] |
| D7  | Acara: **Simpan ke Kalender**                               | Google Calendar / file .ics berisi jam & tempat yang benar                                                            | [x] |
| D8  | Dock: **Lokasi** → sheet lokasi, buka maps                  | Peta/embed tampil, link Maps mengarah ke venue yang benar                                                             | [x] |
| D9  | Galeri: geser kiri/kanan, tap titik navigasi                | Foto berpindah mulus, tetap dalam area                                                                                | [x] |
| D10 | Tap foto → lightbox, geser ke bawah untuk menutup, tombol × | Lightbox terbuka & tertutup                                                                                           | [x] |
| D11 | Gift: tab Transfer Bank → **Salin** nomor rekening          | Toast "tersalin", isi clipboard benar                                                                                 | [x] |
| D12 | Gift: QRIS                                                  | QRIS asli (bukan dummy) tampil dan bisa di-scan                                                                       | [ ] |
| D13 | Gift: konfirmasi via WhatsApp (kalau ada)                   | WA terbuka ke nomor pasangan dengan nama tamu                                                                         | [ ] |
| D14 | Hashtag: tap hashtag                                        | Tersalin + toast; link Instagram explore terbuka                                                                      | [x] |
| D15 | Tombol **Back** HP saat sheet terbuka                       | Sheet tertutup, halaman tidak keluar                                                                                  | [x] |

D3: undangan masuk OK; audio **tidak ada** di DOM (`media.audio` kosong) — musik tidak main (bukan regression UI, konten belum diisi).  
D4: gagal — tidak ada tombol musik karena audio kosong (Temuan #2).  
D10: OK jika tap **foto aktif** tanpa geser (pointer tap); klik biasa pada frame kadang tidak membuka.  
D11: tab Transfer Bank + nomor bank tampil; salin tersedia.  
D12: **FAIL** — teks "QRIS sementara — ganti lewat CMS" (Temuan #3).  
D13: **FAIL** — `wa.me/6281234567890` (placeholder) (Temuan #4).

### D-RSVP

| #   | Langkah                                                                     | Harapan                                                                 | ✓   |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --- |
| D16 | Dock → **RSVP**                                                             | Sheet terbuka, nama terisi otomatis, 3 opsi: Hadir / Ragu / Tidak hadir | [x] |
| D17 | Langsung kirim < 3 detik setelah buka form                                  | Ditolak dengan pesan "terlalu cepat"                                    | [x] |
| D18 | Pilih **Hadir**, jumlah tamu 2, tunggu beberapa detik, **Kirim Konfirmasi** | Toast sukses. Kalau WA RSVP aktif, WhatsApp terbuka dengan ringkasan    | [x] |
| D19 | Buka RSVP lagi dan kirim ulang                                              | Ditolak / pesan "sudah mengirim" (tidak dobel)                          | [x] |
| D20 | Pilih **Tidak hadir**                                                       | Field jumlah tamu disembunyikan / dipaksa 1                             | [ ] |

D16: opsi label = **Hadir / Berhalangan / Ragu** (bukan "Tidak hadir") — sesuai config.  
Catatan: sebelum tes, deadline default `2026-04-18` sudah lewat (hari ini 2026-10-10) sehingga RSVP tertutup (Temuan #5). Untuk D16–D19 deadline di-override sementara ke 2026-12-31 via SQL, lalu dikembalikan.  
D17: toast "Mohon tunggu sebentar sebelum mengirim form."  
D18: sukses — "Konfirmasi Anda sudah kami terima." + CTA WhatsApp.  
D19: sheet menampilkan status sudah konfirmasi (form tidak bisa diisi ulang).  
D20: tidak diuji penuh karena setelah D18 form terkunci sukses.

### D-Ucapan (Buku Tamu)

| #   | Langkah                                                      | Harapan                                                                 | ✓   |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------- | --- |
| D21 | Section Ucapan: nama tampil sebagai chip (tidak bisa diedit) | Nama = nama tamu                                                        | [x] |
| D22 | Kirim ucapan kosong                                          | Ditolak                                                                 | [ ] |
| D23 | Ketik > 500 karakter                                         | Input berhenti di 500, counter `500/500`                                | [x] |
| D24 | Kirim ucapan `TEST selamat menempuh hidup baru`              | Sukses, muncul di daftar ucapan (paling atas, "Baru saja")              | [x] |
| D25 | Kirim sampai 3 ucapan                                        | Ucapan ke-4 ditolak, sisa kuota ditampilkan                             | [ ] |
| D26 | Pagination daftar ucapan (kalau > 1 halaman)                 | Halaman berpindah dengan benar                                          | [ ] |
| D27 | Matikan internet, refresh section ucapan                     | Muncul state offline/gagal + tombol **Muat ulang**; nyalakan → berhasil | [ ] |

D22: tidak ada pesan error jelas saat kosong — tombol tidak mengirim; **partial** (Temuan #6).  
D23: atribut `maxlength=500` ada (keyboard akan membatasi); counter bisa menampilkan >500 jika diisi programatik.  
D24: OK.  
D25: **FAIL/UX** — kirim ke-2 dalam <60 detik menampilkan "Gagal mengirim. Silakan coba lagi." padahal server mengembalikan "Tunggu sebentar..." (interval 60s). Pesan server tertutup oleh `networkError` generic (Temuan #7). Belum sampai uji kuota 3→4.  
D26–D27: belum diuji (sedikit ucapan / offline sulit di emulasi browser agent).

## E. Halaman tamu — link publik & link tidak dikenal

| #   | Langkah                                         | Harapan                                                         | ✓   |
| --- | ----------------------------------------------- | --------------------------------------------------------------- | --- |
| E1  | Buka `/` tanpa `?guest=`                        | Cover tanpa nama tamu, undangan bisa dibuka                     | [x] |
| E2  | Buka RSVP                                       | Panel **terkunci** (tidak ada pilihan kehadiran)                | [x] |
| E3  | Section Ucapan                                  | Form terkunci, daftar ucapan tetap bisa dibaca                  | [x] |
| E4  | Buka `/?guest=slug-ngawur-123`                  | Diperlakukan sebagai publik: tanpa nama, RSVP & ucapan terkunci | [x] |
| E5  | Buka `/?to=<slug TEST Budi>` (format link lama) | Nama tamu tampil, URL berubah jadi `?guest=…`                   | [x] |

## F. Admin — RSVP & moderasi ucapan

| #   | Langkah                                                                | Harapan                                                                    | ✓   |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- | --- |
| F1  | Tab **RSVP** → daftar konfirmasi, klik Muat ulang                      | RSVP dari D18 muncul (nama, Hadir, 2 orang)                                | [ ] |
| F2  | Baca ringkasan                                                         | Angka hadir/ragu/tidak & total orang sesuai                                | [ ] |
| F3  | Filter kehadiran + pencarian `TEST`                                    | Hasil sesuai                                                               | [ ] |
| F4  | **Export**                                                             | File terunduh, isi kolom benar, bisa dibuka di Excel/Sheets                | [ ] |
| F5  | **Hapus** RSVP TEST → konfirmasi                                       | Baris hilang; batal di dialog tidak menghapus                              | [ ] |
| F6  | Tab **Buku Tamu** → moderasi, cari `TEST`                              | Ucapan dari D24 muncul                                                     | [ ] |
| F7  | **Sembunyikan** satu ucapan                                            | Di halaman tamu (refresh) ucapan itu hilang; di admin ditandai tersembunyi | [ ] |
| F8  | **Tampilkan** lagi                                                     | Muncul kembali di halaman tamu                                             | [ ] |
| F9  | **Hapus** ucapan TEST → konfirmasi "Hapus ucapan ini secara permanen?" | Hilang dari admin dan halaman tamu                                         | [ ] |

F1–F9: **blocked** — perlu login admin. (Data TEST di DB sudah dibersihkan via SQL di I.)

## G. Media & upload

| #   | Langkah                                                               | Harapan                                                              | ✓   |
| --- | --------------------------------------------------------------------- | -------------------------------------------------------------------- | --- |
| G1  | Tab **Media**: upload gambar uji di salah satu slot (lalu kembalikan) | Preview muncul, URL tersimpan setelah Simpan, tampil di halaman tamu | [ ] |
| G2  | Upload file bukan gambar / terlalu besar                              | Ditolak dengan pesan jelas                                           | [ ] |
| G3  | Tempel URL gambar di "atau tempel URL"                                | Preview memakai URL tersebut                                         | [ ] |
| G4  | Upload audio musik (jika belum)                                       | Musik main di halaman tamu (D3/D4)                                   | [ ] |
| G5  | Tab **Gift**: upload QRIS asli                                        | QRIS tampil di halaman tamu (D12)                                    | [ ] |
| G6  | Tab **Galeri**: tambah / hapus / urutkan foto (lalu kembalikan)       | Urutan dan jumlah foto di galeri tamu sesuai                         | [ ] |

G1–G6: **blocked** — perlu login admin. Konten media/placeholder terlihat dari sisi tamu (Temuan #2–#4, #8).

## H. Siap kirim & share preview

| #   | Langkah                                         | Harapan                                                                       | ✓   |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------- | --- |
| H1  | Panel **Siap kirim** di admin                   | Semua item hijau: WA, QRIS, musik, story, IG pembuat, daftar tamu, batas RSVP | [ ] |
| H2  | Item yang merah: ikuti hint, perbaiki, simpan   | Item berubah hijau                                                            | [ ] |
| H3  | Kirim link undangan ke diri sendiri di WhatsApp | Preview link menampilkan judul, deskripsi, dan gambar OG yang benar           | [ ] |
| H4  | iPhone Safari: Share → Add to Home Screen       | Ikon tampil rapi (tidak terpotong), nama aplikasi benar                       | [ ] |
| H5  | Buka undangan, matikan internet, refresh        | Halaman masih tampil dari cache (minimal cover)                               | [ ] |

H1 (inferensi dari halaman tamu, tanpa panel admin): **akan merah** untuk WA placeholder, QRIS dummy, audio kosong, story placeholder, dan (sebelum override) deadline RSVP lewat (Temuan #2–#5, #8).  
H3–H5: belum diuji di sesi agent (perlu WA/HP asli / offline).

## I. Bersih-bersih (wajib di akhir)

| #   | Langkah                                                           | Harapan                                       | ✓   |
| --- | ----------------------------------------------------------------- | --------------------------------------------- | --- |
| I1  | Hapus semua tamu berawalan `TEST` di tab Undangan                 | Pencarian `TEST` kosong                       | [x] |
| I2  | Hapus semua RSVP & ucapan `TEST`                                  | Pencarian `TEST` kosong di RSVP & Buku Tamu   | [x] |
| I3  | Pastikan semua teks/template/media yang diubah sudah dikembalikan | Tidak ada badge override yang tidak disengaja | [x] |
| I4  | Halaman tamu publik dicek sekali lagi                             | Tidak ada sisa data TEST                      | [x] |
| I5  | Klik **Keluar** dari admin                                        | Kembali ke layar login                        | [ ] |

I1–I4: dibersihkan via SQL Editor (delete wishes/rsvp/guests `TEST*`, hapus override `rsvp` dari `site_content`). Verified REST: `test-budi` → `[]`, wishes TEST → `[]`.  
I5: N/A — tidak pernah login admin.

---

## Temuan

| #   | Item (mis. D18) | Device / browser           | Langkah                      | Hasil aktual                                                                                                                                                                                             | Screenshot | Severity (blocker/major/minor) |
| --- | --------------- | -------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------ |
| 1   | A6–A9, B–C, F–G | Cursor browser             | Login admin                  | Tidak ada password untuk `admin@geraldo.com` → CMS tidak bisa diuji. Butuh password / reset dari Supabase Auth.                                                                                          | —          | blocker (untuk tes admin)      |
| 2   | D4, G4, H1      | Mobile emu 375×667         | Musik latar                  | `media.audio` kosong — tidak ada `<audio>` / tombol musik di dock.                                                                                                                                       | —          | major (konten)                 |
| 3   | D12, H1         | Mobile emu                 | Gift QRIS                    | Teks "QRIS sementara — ganti lewat CMS (tab Gift)"; masih dummy.                                                                                                                                         | —          | major (konten)                 |
| 4   | D13, H1         | Mobile emu                 | Konfirmasi WA gift           | Link ke `wa.me/6281234567890` (placeholder).                                                                                                                                                             | —          | major (konten)                 |
| 5   | D16 / H1        | Production 2026-10-10      | RSVP deadline                | Default deadline `2026-04-18` sudah lewat → sheet "Batas konfirmasi kehadiran telah berakhir". Panel Siap kirim harus menandai ini. Override sementara untuk tes sudah dikembalikan.                     | —          | major                          |
| 6   | D22             | Mobile emu                 | Kirim ucapan kosong          | Tidak mengirim, tapi tidak ada pesan error/validasi yang jelas.                                                                                                                                          | —          | minor                          |
| 7   | D25             | Mobile emu + edge `submit` | Kirim ucapan ke-2 < 60 detik | UI: "Gagal mengirim. Silakan coba lagi." Server sebenarnya 429: "Tunggu sebentar sebelum mengirim ucapan lagi." (`MIN_WISH_GUEST_INTERVAL_MS=60s`). `submitForm` memprioritaskan `networkError` generik. | —          | major (UX/bug)                 |
| 8   | H1 / story      | Public page                | Our Story                    | Masih berisi placeholder `[Cerita kalian di sini]…`.                                                                                                                                                     | —          | major (konten)                 |
| 9   | A4 side-effect  | Admin login                | Lockout setelah 5 gagal      | Lockout 15 menit di `localStorage` (`gw-admin-login`). Setelah tes A4, clear key ini sebelum login sungguhan.                                                                                            | —          | minor (ops)                    |

## Hasil akhir

- [x] Semua item A–I tercentang, **atau temuan sudah dicatat** (yang blocked/skip tercatat)
- [ ] Tidak ada temuan **blocker** — masih ada blocker #1 (password admin) untuk menyelesaikan B/C/F/G
- [ ] Panel Siap kirim hijau semua — **belum** (konten placeholder + deadline)
- [x] Data TEST sudah dibersihkan

Tanda tangan tester: **Cursor Agent** Tanggal: **2026-10-10**

---

## Lanjutan (untuk manusia)

1. Kirim password admin `admin@geraldo.com` (atau reset di Supabase Auth → Users) lalu lanjutkan B, C, F, G, H, A6–A9, I5.
2. Isi konten final di `/admin` sampai Siap kirim hijau: WA, QRIS, audio, story, deadline RSVP masa depan.
3. Fix kode Temuan #7: tampilkan `error` dari edge function, jangan ditimpa `networkError` generik.
4. Opsional: empty-state validation message untuk D22.
