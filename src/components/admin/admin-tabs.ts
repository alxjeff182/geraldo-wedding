import type { AdminTab } from "./types";

export type { AdminTab };

export const TABS: { id: AdminTab; label: string; description: string }[] = [
  { id: "umum", label: "Umum", description: "Judul, sampul, tanggal, dan teks pembuka" },
  { id: "undangan", label: "Undangan", description: "Daftar tamu, nomor WA, dan kirim link undangan" },
  { id: "mempelai", label: "Mempelai", description: "Nama, foto, Instagram, dan caption mempelai" },
  { id: "acara", label: "Acara", description: "Jadwal, venue, caption section acara" },
  { id: "galeri", label: "Galeri", description: "Judul, subtitle, dan foto galeri" },
  { id: "gift", label: "Gift", description: "Rekening, alamat kado, dan tombol salin" },
  { id: "rsvp", label: "RSVP", description: "Form konfirmasi kehadiran dan daftar tamu yang hadir" },
  { id: "guestbook", label: "Buku Tamu", description: "Form ucapan dan pesan tamu" },
  { id: "penutup", label: "Penutup", description: "Ayat, penutup, hashtag, dan footer" },
  { id: "media", label: "Media", description: "Cover, video, audio, dan aset visual" },
];
