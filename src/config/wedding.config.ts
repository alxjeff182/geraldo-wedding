import { DEFAULT_INVITE_TEMPLATE_ID, INVITE_MESSAGE_TEMPLATES } from "./invite-templates";

export type WeddingEvent = {
  name: string;
  dateLabel: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  /** ISO datetime for calendar export */
  startsAt: string;
  /** ISO datetime for calendar export */
  endsAt: string;
};

export type GiftAccount = {
  bank: string;
  number: string;
  holder: string;
  logo: string;
};

export const wedding = {
  site: {
    title: "Geraldo & Christin",
    description: "Pernikahan Geraldo & Christin. Tangerang, 25 April 2026",
    url: import.meta.env.VITE_SITE_URL || "http://localhost:5173",
    noIndex: false,
    creator: {
      name: "Jeffry Alexander",
      url: "https://jeff-interactive-resume.vercel.app/en",
      websiteUrl: "https://jeff-interactive-resume.vercel.app/en",
      instagramUrl: "https://instagram.com/",
    },
  },

  couple: {
    groom: {
      shortName: "Geraldo",
      fullName: "Geraldo Gracedo Sudena Tampubolon",
      parents: "Putra dari A. Tampubolon / br. Situmorang",
      instagram: "https://instagram.com/geraldo.gracedo",
      instagramHandle: "@geraldo.gracedo",
      photo: "/assets/ballroom/couple/groom.jpg",
    },
    bride: {
      shortName: "Christin",
      fullName: "Christin Samosir, S.M.",
      parents: "Putri dari R. Samosir / br. Silalahi",
      instagram: "https://instagram.com/christin.samosir",
      instagramHandle: "@christin.samosir",
      photo: "/assets/ballroom/couple/bride.jpg",
    },
  },

  contact: {
    whatsappNumber: "6281234567890",
    rsvpWhatsappEnabled: true,
    rsvpWhatsappTemplate:
      "Halo, saya *{nama}* mengkonfirmasi kehadiran untuk pernikahan {pasangan}.\nKehadiran: {kehadiran}\nJumlah tamu: {jumlah}{ucapan}",
    giftWhatsappTemplate:
      "Halo, saya *{nama}* sudah mengirim hadiah untuk {pasangan}.\nMetode: {metode}",
  },

  date: "2026-04-25T08:00:00+07:00",
  dateLabel: "Sabtu, 25 April 2026",
  dateShort: "25 . 04 . 2026",
  location: "Tangerang",

  hero: {
    eyebrow: "The Wedding Of",
    groomName: "Geraldo Tampubolon",
    brideName: "Christin Samosir, S.M.",
  },

  intro:
    "Dengan penuh sukacita dan mengucap syukur kepada Tuhan Yesus Kristus, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam pemberkatan pernikahan kami. Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan mendoakan kami.",

  quote: "Constantly, consistently, continually, You.",

  bibleQuote:
    "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
  bibleReference: "Matius 19:6",

  events: [
    {
      name: "Pemberkatan",
      dateLabel: "Sabtu\n25 . 04 . 2026",
      time: "08.00 WIB",
      venue: "GPI Pondok Arum",
      address: "Perum. Pondok Arum, Blok J No. 26, Kel. Pabuaran Tumpeng, Kec. Karawaci, Tangerang",
      mapsUrl: "https://share.google/grqB2yx9JoR0Cdkdq",
      startsAt: "2026-04-25T08:00:00+07:00",
      endsAt: "2026-04-25T10:00:00+07:00",
    },
    {
      name: "Resepsi & Adat",
      dateLabel: "Sabtu\n25 . 04 . 2026",
      time: "11.00 WIB",
      venue: "UFIT HALL GK",
      address: "Jl. Palem Raja Raya No.31, Panunggangan Bar., Kec. Cibodas, Kab. Tangerang",
      mapsUrl: "https://share.google/xxDvbeTIhjN0hvbBg",
      startsAt: "2026-04-25T11:00:00+07:00",
      endsAt: "2026-04-25T15:00:00+07:00",
    },
  ] satisfies WeddingEvent[],

  story: {
    enabled: true,
    title: "Our Story",
    subtitle: "Constantly, consistently, continually, You.",
    paragraphs: [
      "[Cerita kalian di sini] Ceritakan singkat bagaimana kalian bertemu dan tumbuh bersama.",
      "[Cerita kalian di sini] Tutup dengan rasa syukur dan undangan untuk merayakan bersama.",
    ],
  },

  guestGuide: {
    enabled: true,
    title: "Info untuk Tamu",
    subtitle: "Dress code dan tip lokasi agar kehadiran Anda lebih nyaman.",
    dressCodeTitle: "Dress Code",
    dressCode:
      "Formal / Elegant dengan nuansa maroon & gold. Untuk tamu keluarga adat, ulos dipersilakan sesuai kebiasaan keluarga masing-masing.",
    tipsTitle: "Parkir & Akomodasi",
    tips: "Parkir tersedia di area UFIT HALL GK untuk resepsi.\nTamu dari luar kota dapat menginap di sekitar Karawaci / Cibodas (akses mudah ke kedua venue).",
  },

  gallery: {
    title: "Galeri",
    subtitle: "Constantly, consistently,\ncontinually, You.",
    images: [
      { src: "/assets/ballroom/gallery/01.jpg", alt: "Bersama" },
      { src: "/assets/ballroom/gallery/02.jpg", alt: "Ulos Pertama" },
      { src: "/assets/ballroom/gallery/03.jpg", alt: "Padang Hijau" },
      { src: "/assets/ballroom/gallery/04.jpg", alt: "Dalam Pelukan" },
      { src: "/assets/ballroom/gallery/05.jpg", alt: "Hari Kami" },
      { src: "/assets/ballroom/gallery/06.jpg", alt: "Adat Batak" },
      { src: "/assets/ballroom/gallery/07.jpg", alt: "Menoleh" },
      { src: "/assets/ballroom/gallery/08.jpg", alt: "Payung Putih" },
    ],
  },

  gift: {
    title: "Kirim Tanda Kasih",
    description:
      "Doa restu Anda sudah lebih dari cukup. Bila ingin berbagi kebahagiaan, kami sediakan cara mudah di bawah ini.",
    physicalAddress:
      "Perum. Taman Danau Indah Blok J No. 26, Kel. Pabuaran Tumpeng, Kec. Karawaci, Tangerang",
    qris: "/assets/ballroom/qris-dummy.svg",
    accounts: [
      {
        bank: "BCA",
        number: "6705188657",
        holder: "Christin Samosir, S.M.",
        logo: "/assets/ballroom/bca-logo.png",
      },
    ] satisfies GiftAccount[],
  },

  hashtag: {
    title: "Share Your Moments",
    tag: "#GeraldoChristin2026",
    photo: "/assets/ballroom/og-image.jpg",
    copySuccess: "Hashtag disalin",
    instagramButton: "Lihat di Instagram",
  },

  music: {
    playLabel: "Putar musik",
    muteLabel: "Matikan musik",
  },

  opening: {
    skipLabel: "Lewati",
  },

  closing: {
    paragraphs: ["Terima kasih atas doa dan kehadiran Anda."],
  },

  media: {
    coverBg: "/assets/ballroom/cover-frame.jpg",
    audio: "/assets/ballroom/goodness-of-god.mp3",
    ogImage: "/assets/ballroom/og-image.jpg",
    logo: "/assets/ballroom/logo.png",
    openingVideo: "/assets/ballroom/opening.mp4",
    heroFramesBase: "/assets/ballroom/hero-frames",
    heroFrameCount: 24,
    heroPoster: "/assets/ballroom/hero-poster.jpg",
  },

  rsvp: {
    title: "RSVP",
    subtitle: "Konfirmasi kehadiran Anda dengan mengisi form berikut",
    note: "*Mohon maaf! Khusus untuk tamu undangan",
    deadline: "2026-04-18T23:59:59+07:00",
    deadlineLabel: "Mohon konfirmasi sebelum {date}",
    deadlineClosedMessage:
      "Batas konfirmasi kehadiran telah berakhir. Terima kasih atas perhatiannya.",
    nameLabel: "Nama",
    namePlaceholder: "Nama lengkap",
    messagePlaceholder: "Tulis ucapan untuk kami…",
    attendanceLabel: "Kehadiran",
    attendanceAriaLabel: "Pilihan kehadiran",
    guestCountLabel: "Jumlah tamu",
    guestCountAriaLabel: "Jumlah kehadiran",
    guestCountPlaceholder: "Pilih",
    guestCountOptions: ["1", "2", "3"],
    submit: "Kirim Konfirmasi",
    submitting: "Mengirim...",
    defaultAttendance: "hadir",
    errorMessage: "Gagal mengirim RSVP. Silakan coba lagi.",
    successMessage: "Konfirmasi Anda sudah kami terima.",
    alreadySubmittedMessage: "Anda sudah mengirim konfirmasi kehadiran. Terima kasih!",
    tooFastMessage: "Mohon tunggu sebentar sebelum mengirim form.",
    spamNameMessage: "Nama tidak valid. Mohon isi nama asli Anda.",
    localSuccessMessage: "RSVP tersimpan secara lokal (hubungkan Supabase untuk penyimpanan)",
    networkErrorMessage: "Gagal mengirim. Silakan coba lagi.",
    supabaseErrorMessage: "Supabase tidak tersedia",
    listTitle: "Daftar Konfirmasi Kehadiran",
    listSubtitle: "Tamu yang sudah mengisi form RSVP di undangan.",
    searchPlaceholder: "Cari nama tamu...",
    emptyList: "Belum ada konfirmasi kehadiran.",
    loadError: "Gagal memuat daftar RSVP",
    refreshButton: "Muat Ulang",
    exportButton: "Export CSV",
    exportSuccess: "File CSV berhasil diunduh",
    deleteConfirm: "Hapus konfirmasi kehadiran ini?",
    deletedMessage: "Konfirmasi dihapus",
    deleteError: "Gagal menghapus konfirmasi",
    filterAll: "Semua",
    filterHadir: "Hadir",
    filterTidak: "Tidak Hadir",
    filterRagu: "Ragu",
    colDate: "Waktu",
    colName: "Nama",
    colCount: "Jumlah",
    colAttendance: "Kehadiran",
    colGuest: "Tamu Undangan",
    colActions: "Aksi",
    attendanceHadir: "Hadir",
    attendanceTidak: "Berhalangan",
    attendanceRagu: "Ragu",
    statTotal: "Konfirmasi",
    statPeople: "Total Orang",
    statHadir: "Hadir",
    statTidak: "Tidak Hadir",
    liveUpdateMessage: "Konfirmasi RSVP baru masuk",
  },

  guestbook: {
    enabled: true,
    title: "Ucapan & Doa",
    subtitle: "Kirim doa dan ucapan untuk kedua mempelai",
    namePlaceholder: "Nama",
    messagePlaceholder: "Tulis doa atau ucapan…",
    submit: "Kirim Ucapan",
    submitting: "Mengirim...",
    emptyMessage: "Belum ada ucapan. Jadilah yang pertama!",
    emptyNoSupabase: "Hubungkan Supabase untuk menampilkan buku tamu.",
    lockedMessage: "Buka undangan dari link pribadi Anda untuk mengirim ucapan.",
    limitReachedMessage: "Batas 3 ucapan per undangan sudah tercapai.",
    remainingLabel: "Sisa {n} ucapan",
    pagerPrev: "Sebelumnya",
    pagerNext: "Selanjutnya",
    errorMessage: "Gagal mengirim ucapan. Silakan coba lagi.",
    successMessage: "Terima kasih atas ucapan Anda!",
    localSuccessMessage: "Ucapan tersimpan secara lokal (hubungkan Supabase untuk penyimpanan)",
    networkErrorMessage: "Gagal mengirim. Silakan coba lagi.",
    supabaseErrorMessage: "Supabase tidak tersedia",
  },

  cover: {
    eyebrow: "Wedding Invitation",
    salutation: "Kepada Yth.",
    openButton: "Buka Undangan",
    openButtonAriaLabel: "Buka undangan pernikahan",
  },

  coupleSection: {
    prefix: "Sang",
    title: "Mempelai",
    connector: "dengan",
  },

  countdown: {
    title: "Counting The Days",
    heading: "Hitung mundur menuju hari pernikahan",
    labels: {
      days: "hari",
      hours: "jam",
      minutes: "menit",
      seconds: "detik",
    },
  },

  eventsSection: {
    title: "Wedding\nEvent",
    titleEmbedded: "Detail Acara",
    subtitle: "Acara akan dilaksanakan pada:",
    venueLabel: "Bertempat di",
    venueLabelColon: "Bertempat di:",
    mapsButton: "Petunjuk Arah",
    calendarGoogleButton: "Simpan Kalender",
    sheetMapsButton: "Buka Maps",
    sheetCalendarButton: "Kalender",
    calendarIcsButton: "Unduh .ics",
    calendarFabLabel: "Tambah ke Kalender",
    calendarSaveAll: "Simpan ke Kalender",
  },

  giftUi: {
    openButton: "Kirim Hadiah",
    bankLabel: "Bank",
    accountNumberLabel: "No. Rekening —",
    accountHolderPrefix: "a.n",
    copyAccountButton: "Salin Nomor Rekening",
    physicalGiftTitle: "Kirim Kado",
    copyAddressButton: "Salin Alamat",
    copyAccountSuccess: "Nomor rekening tersalin",
    copyAddressSuccess: "Alamat berhasil disalin",
    copyError: "Gagal menyalin",
  },

  footer: {
    creditPrefix: "© 2026 · Undangan Digital",
    portfolioPrompt: "Kunjungi portfolio di bawah ini:",
    websiteAriaLabel: "Kunjungi website",
    instagramAriaLabel: "Kunjungi Instagram",
    ariaLabel: "Kredit pembuat undangan",
  },

  shortcuts: {
    countdown: "Waktu",
    events: "Lokasi",
    rsvp: "RSVP",
    navAriaLabel: "Navigasi cepat undangan",
    openAriaLabel: "Buka",
  },

  invite: {
    whatsappTemplates: INVITE_MESSAGE_TEMPLATES,
    defaultTemplateId: DEFAULT_INVITE_TEMPLATE_ID,
    salutation: "Yth.",
    listTitle: "Daftar Tamu Undangan",
    listSubtitle: "Kelola nomor WhatsApp dan kirim link undangan personal ke setiap tamu.",
    addGuestButton: "Tambah Tamu",
    searchPlaceholder: "Cari nama atau nomor...",
    emptyGuests: "Belum ada tamu. Tambahkan tamu pertama untuk mulai mengirim undangan.",
    copyLink: "Salin Link",
    copyLinkSuccess: "Link undangan disalin",
    openWhatsApp: "Kirim WA",
    noPhone: "Isi nomor telepon dulu",
    saveTemplateHint: "Setelah mengubah template pesan, klik «Simpan Perubahan» di atas.",
    templateLabel: "Template Pesan WhatsApp",
    templatesSubtitle:
      "Pilih dan edit salah satu dari 3 template undangan. Setiap tamu bisa dikirim dengan template berbeda.",
    templateSelectLabel: "Template kirim",
    defaultTemplateLabel: "Template bawaan daftar tamu",
    templateNameLabel: "Nama template",
    templateMessageLabel: "Isi pesan",
    phoneLabel: "No. WhatsApp",
    nameLabel: "Nama Tamu",
    slugLabel: "Slug URL",
    linkLabel: "Link Undangan",
    deleteConfirm: "Hapus tamu ini dari daftar?",
    guestAdded: "Tamu berhasil ditambahkan",
    guestUpdated: "Data tamu diperbarui",
    guestDeleted: "Tamu dihapus",
    guestNameRequired: "Nama tamu tidak boleh kosong.",
    guestError: "Gagal menyimpan data tamu",
    bulkToggle: "Import massal",
    bulkPastePlaceholder: "Satu baris per tamu: Nama, 08xxxxxxxxxx",
    bulkPasteHint: "Pisahkan dengan koma, tab, |, atau titik koma. Nomor WA opsional.",
    bulkCsvHint:
      "Unggah CSV (slug,display_name,phone). Kolom slug diabaikan — digenerate otomatis.",
    bulkCsvButton: "Pilih file CSV",
    bulkPreviewButton: "Preview",
    bulkImportButton: "Import {n} tamu",
    bulkCancelButton: "Batal",
    bulkReadyLabel: "{ready} siap / {error} error",
    bulkColStatus: "Status",
    bulkStatusOk: "Siap",
    bulkImported: "{n} tamu berhasil diimpor",
    bulkImportError: "Gagal mengimpor tamu",
    bulkEmptyPreview: "Belum ada baris untuk dipreview. Tempel daftar atau unggah CSV.",
    waSentLabel: "Terkirim",
    waUnsentLabel: "Belum",
    markWaSent: "Tandai terkirim",
    markWaUnsent: "Tandai belum",
    waMarkedSent: "Ditandai sudah dikirim WA",
    waMarkedUnsent: "Status WA dikembalikan ke belum",
  },
} as const;

export type WeddingConfig = typeof wedding;
