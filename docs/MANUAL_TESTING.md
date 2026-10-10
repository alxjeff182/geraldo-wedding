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

| Tester | Tanggal | Device / Browser tamu | Device / Browser admin | Commit / versi |
| ------ | ------- | --------------------- | ---------------------- | -------------- |
|        |         |                       |                        |                |

---

## A. Login & keamanan admin

| #   | Langkah                                            | Harapan                                                                              | ✓   |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------ | --- |
| A1  | Buka `/admin` tanpa login                          | Muncul layar login (Email, Password, tombol **Masuk ke CMS**). Editor tidak terlihat | [ ] |
| A2  | Klik Masuk dengan field kosong                     | Ditolak / validasi muncul, tidak masuk                                               | [ ] |
| A3  | Login dengan password salah                        | Pesan error jelas, tetap di layar login                                              | [ ] |
| A4  | Ulangi password salah beberapa kali berturut-turut | Muncul pesan "Terlalu banyak percobaan login. Coba lagi dalam X menit."              | [ ] |
| A5  | Login dengan akun yang **bukan admin** (kalau ada) | Ditolak, tidak bisa melihat editor                                                   | [ ] |
| A6  | Login dengan akun admin yang benar                 | Masuk ke editor, tab **Umum** aktif, panel **Siap kirim** terlihat                   | [ ] |
| A7  | Refresh halaman                                    | Tetap login                                                                          | [ ] |
| A8  | Klik **Keluar**                                    | Kembali ke layar login. Tombol Back browser tidak membuka editor lagi                | [ ] |
| A9  | Login ulang untuk lanjut ke bagian berikut         | Berhasil                                                                             | [ ] |

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

## D. Halaman tamu — link personal (`?guest=<slug TEST Budi>`)

Buka di **HP**, Incognito.

| #   | Langkah                                                     | Harapan                                                                                                               | ✓   |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --- |
| D1  | Buka link personal                                          | Cover tampil: "Kepada Yth." + nama tamu, tanggal, tombol **Buka Undangan**                                            | [ ] |
| D2  | Klik **Buka Undangan**                                      | Video pembuka main, tombol **Lewati** langsung terlihat                                                               | [ ] |
| D3  | Klik **Lewati**                                             | Masuk ke undangan, musik mulai (kalau audio diisi)                                                                    | [ ] |
| D4  | Tombol musik: matikan / nyalakan                            | Ikon berubah, audio berhenti/main                                                                                     | [ ] |
| D5  | Scroll seluruh halaman dari atas ke bawah                   | Hero, mempelai, story, acara, panduan, galeri, gift, ucapan, hashtag, footer tampil rapi, tidak ada scroll horizontal | [ ] |
| D6  | Kartu mempelai: tap / Enter untuk flip, link Instagram      | Kartu berbalik, link IG membuka profil yang benar                                                                     | [ ] |
| D7  | Acara: **Simpan ke Kalender**                               | Google Calendar / file .ics berisi jam & tempat yang benar                                                            | [ ] |
| D8  | Dock: **Lokasi** → sheet lokasi, buka maps                  | Peta/embed tampil, link Maps mengarah ke venue yang benar                                                             | [ ] |
| D9  | Galeri: geser kiri/kanan, tap titik navigasi                | Foto berpindah mulus, tetap dalam area                                                                                | [ ] |
| D10 | Tap foto → lightbox, geser ke bawah untuk menutup, tombol × | Lightbox terbuka & tertutup                                                                                           | [ ] |
| D11 | Gift: tab Transfer Bank → **Salin** nomor rekening          | Toast "tersalin", isi clipboard benar                                                                                 | [ ] |
| D12 | Gift: QRIS                                                  | QRIS asli (bukan dummy) tampil dan bisa di-scan                                                                       | [ ] |
| D13 | Gift: konfirmasi via WhatsApp (kalau ada)                   | WA terbuka ke nomor pasangan dengan nama tamu                                                                         | [ ] |
| D14 | Hashtag: tap hashtag                                        | Tersalin + toast; link Instagram explore terbuka                                                                      | [ ] |
| D15 | Tombol **Back** HP saat sheet terbuka                       | Sheet tertutup, halaman tidak keluar                                                                                  | [ ] |

### D-RSVP

| #   | Langkah                                                                     | Harapan                                                                 | ✓   |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --- |
| D16 | Dock → **RSVP**                                                             | Sheet terbuka, nama terisi otomatis, 3 opsi: Hadir / Ragu / Tidak hadir | [ ] |
| D17 | Langsung kirim < 3 detik setelah buka form                                  | Ditolak dengan pesan "terlalu cepat"                                    | [ ] |
| D18 | Pilih **Hadir**, jumlah tamu 2, tunggu beberapa detik, **Kirim Konfirmasi** | Toast sukses. Kalau WA RSVP aktif, WhatsApp terbuka dengan ringkasan    | [ ] |
| D19 | Buka RSVP lagi dan kirim ulang                                              | Ditolak / pesan "sudah mengirim" (tidak dobel)                          | [ ] |
| D20 | Pilih **Tidak hadir**                                                       | Field jumlah tamu disembunyikan / dipaksa 1                             | [ ] |

### D-Ucapan (Buku Tamu)

| #   | Langkah                                                      | Harapan                                                                 | ✓   |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------- | --- |
| D21 | Section Ucapan: nama tampil sebagai chip (tidak bisa diedit) | Nama = nama tamu                                                        | [ ] |
| D22 | Kirim ucapan kosong                                          | Ditolak                                                                 | [ ] |
| D23 | Ketik > 500 karakter                                         | Input berhenti di 500, counter `500/500`                                | [ ] |
| D24 | Kirim ucapan `TEST selamat menempuh hidup baru`              | Sukses, muncul di daftar ucapan (paling atas, "Baru saja")              | [ ] |
| D25 | Kirim sampai 3 ucapan                                        | Ucapan ke-4 ditolak, sisa kuota ditampilkan                             | [ ] |
| D26 | Pagination daftar ucapan (kalau > 1 halaman)                 | Halaman berpindah dengan benar                                          | [ ] |
| D27 | Matikan internet, refresh section ucapan                     | Muncul state offline/gagal + tombol **Muat ulang**; nyalakan → berhasil | [ ] |

## E. Halaman tamu — link publik & link tidak dikenal

| #   | Langkah                                         | Harapan                                                         | ✓   |
| --- | ----------------------------------------------- | --------------------------------------------------------------- | --- |
| E1  | Buka `/` tanpa `?guest=`                        | Cover tanpa nama tamu, undangan bisa dibuka                     | [ ] |
| E2  | Buka RSVP                                       | Panel **terkunci** (tidak ada pilihan kehadiran)                | [ ] |
| E3  | Section Ucapan                                  | Form terkunci, daftar ucapan tetap bisa dibaca                  | [ ] |
| E4  | Buka `/?guest=slug-ngawur-123`                  | Diperlakukan sebagai publik: tanpa nama, RSVP & ucapan terkunci | [ ] |
| E5  | Buka `/?to=<slug TEST Budi>` (format link lama) | Nama tamu tampil, URL berubah jadi `?guest=…`                   | [ ] |

## F. Admin — RSVP & moderasi ucapan

| #   | Langkah                                                                | Harapan                                                                    | ✓   |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- | --- |
| F1  | Tab **RSVP** → daftar konfirmasi, klik Muat ulang                      | RSVP dari D18 muncul (nama, Hadir, 2 orang)                                | [ ] |
| F2  | Statistik ringkasan                                                    | Angka hadir/ragu/tidak & total orang sesuai                                | [ ] |
| F3  | Filter kehadiran + pencarian `TEST`                                    | Hasil sesuai                                                               | [ ] |
| F4  | **Export**                                                             | File terunduh, isi kolom benar, bisa dibuka di Excel/Sheets                | [ ] |
| F5  | **Hapus** RSVP TEST → konfirmasi                                       | Baris hilang; batal di dialog tidak menghapus                              | [ ] |
| F6  | Tab **Buku Tamu** → moderasi, cari `TEST`                              | Ucapan dari D24 muncul                                                     | [ ] |
| F7  | **Sembunyikan** satu ucapan                                            | Di halaman tamu (refresh) ucapan itu hilang; di admin ditandai tersembunyi | [ ] |
| F8  | **Tampilkan** lagi                                                     | Muncul kembali di halaman tamu                                             | [ ] |
| F9  | **Hapus** ucapan TEST → konfirmasi "Hapus ucapan ini secara permanen?" | Hilang dari admin dan halaman tamu                                         | [ ] |

## G. Media & upload

| #   | Langkah                                                               | Harapan                                                              | ✓   |
| --- | --------------------------------------------------------------------- | -------------------------------------------------------------------- | --- |
| G1  | Tab **Media**: upload gambar uji di salah satu slot (lalu kembalikan) | Preview muncul, URL tersimpan setelah Simpan, tampil di halaman tamu | [ ] |
| G2  | Upload file bukan gambar / terlalu besar                              | Ditolak dengan pesan jelas                                           | [ ] |
| G3  | Tempel URL gambar di "atau tempel URL"                                | Preview memakai URL tersebut                                         | [ ] |
| G4  | Upload audio musik (jika belum)                                       | Musik main di halaman tamu (D3/D4)                                   | [ ] |
| G5  | Tab **Gift**: upload QRIS asli                                        | QRIS tampil di halaman tamu (D12)                                    | [ ] |
| G6  | Tab **Galeri**: tambah / hapus / urutkan foto (lalu kembalikan)       | Urutan dan jumlah foto di galeri tamu sesuai                         | [ ] |

## H. Siap kirim & share preview

| #   | Langkah                                         | Harapan                                                                       | ✓   |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------- | --- |
| H1  | Panel **Siap kirim** di admin                   | Semua item hijau: WA, QRIS, musik, story, IG pembuat, daftar tamu, batas RSVP | [ ] |
| H2  | Item yang merah: ikuti hint, perbaiki, simpan   | Item berubah hijau                                                            | [ ] |
| H3  | Kirim link undangan ke diri sendiri di WhatsApp | Preview link menampilkan judul, deskripsi, dan gambar OG yang benar           | [ ] |
| H4  | iPhone Safari: Share → Add to Home Screen       | Ikon tampil rapi (tidak terpotong), nama aplikasi benar                       | [ ] |
| H5  | Buka undangan, matikan internet, refresh        | Halaman masih tampil dari cache (minimal cover)                               | [ ] |

## I. Bersih-bersih (wajib di akhir)

| #   | Langkah                                                           | Harapan                                       | ✓   |
| --- | ----------------------------------------------------------------- | --------------------------------------------- | --- |
| I1  | Hapus semua tamu berawalan `TEST` di tab Undangan                 | Pencarian `TEST` kosong                       | [ ] |
| I2  | Hapus semua RSVP & ucapan `TEST`                                  | Pencarian `TEST` kosong di RSVP & Buku Tamu   | [ ] |
| I3  | Pastikan semua teks/template/media yang diubah sudah dikembalikan | Tidak ada badge override yang tidak disengaja | [ ] |
| I4  | Halaman tamu publik dicek sekali lagi                             | Tidak ada sisa data TEST                      | [ ] |
| I5  | Klik **Keluar** dari admin                                        | Kembali ke layar login                        | [ ] |

---

## Temuan

| #   | Item (mis. D18) | Device / browser | Langkah | Hasil aktual | Screenshot | Severity (blocker/major/minor) |
| --- | --------------- | ---------------- | ------- | ------------ | ---------- | ------------------------------ |
| 1   |                 |                  |         |              |            |                                |

## Hasil akhir

- [ ] Semua item A–I tercentang, atau temuan sudah dicatat
- [ ] Tidak ada temuan **blocker**
- [ ] Panel Siap kirim hijau semua
- [ ] Data TEST sudah dibersihkan

Tanda tangan tester: **\_\_\_\_\_\_\_\_** Tanggal: **\_\_\_\_\_\_\_\_**
