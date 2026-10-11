import { DEFAULT_INVITE_TEMPLATE_ID, INVITE_MESSAGE_TEMPLATES } from "./invite-templates";

export type WeddingEvent = {
  name: string;
  dateLabel: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  /** WGS84 latitude — used for precise native maps / directions */
  lat?: number;
  /** WGS84 longitude — used for precise native maps / directions */
  lng?: number;
  /** Google Maps place CID (decimal) — embed shows the place card instead of raw coordinates */
  mapsCid?: string;
  /** ISO datetime for calendar export */
  startsAt: string;
  /** ISO datetime for calendar export */
  endsAt: string;
};

export type StoryMilestone = {
  date: string;
  title: string;
  text: string;
  /** Optional photo URL — empty string means no photo */
  photo: string;
};

export type GiftSide = "groom" | "bride";

export type GiftAccount = {
  bank: string;
  number: string;
  holder: string;
  logo: string;
  /** Which spouse this account belongs to */
  side?: GiftSide;
};

export const wedding = {
  site: {
    title: "Geraldo & Christin",
    description: "Pernikahan Geraldo & Christin. Tangerang, 24 Oktober 2026",
    url: import.meta.env.VITE_SITE_URL || "http://localhost:5173",
    noIndex: false,
    creator: {
      name: "Jeffry Alexander",
      url: "https://jeff-interactive-resume.vercel.app/en",
      websiteUrl: "https://jeff-interactive-resume.vercel.app/en",
      instagramUrl: "",
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
      fullName: "Christin br. Samosir",
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

  date: "2026-10-24T08:00:00+07:00",
  dateLabel: "Sabtu, 24 Oktober 2026",
  dateShort: "24 . 10 . 2026",
  location: "Tangerang",

  hero: {
    eyebrow: "The Wedding Of",
    groomName: "Geraldo Tampubolon",
    brideName: "Christin br. Samosir",
  },

  intro:
    "Dengan penuh sukacita dan mengucap syukur kepada Tuhan Yesus Kristus, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam pemberkatan pernikahan kami. Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan mendoakan kami.",

  quote: "Constantly, consistently, continually, You.",

  bibleQuote: "Kekasihku kepunyaanku, dan aku kepunyaan dia.",
  bibleReference: "Kidung Agung 2:16",

  events: [
    {
      name: "Pemberkatan",
      dateLabel: "Sabtu\n24 . 10 . 2026",
      time: "08.00 WIB",
      venue: "Gereja HKBP Ress. Kebon Jeruk",
      address: "Gereja HKBP Ress. Kebon Jeruk, Jakarta Barat",
      mapsUrl: "https://maps.app.goo.gl/CTqpxvQrfmLgQpsb8",
      lat: -6.1839709,
      lng: 106.7553829,
      mapsCid: "14120004088073944725",
      startsAt: "2026-10-24T08:00:00+07:00",
      endsAt: "2026-10-24T10:00:00+07:00",
    },
    {
      name: "Resepsi & Adat",
      dateLabel: "Sabtu\n24 . 10 . 2026",
      time: "11.00 WIB",
      venue: "Gedung Gorga",
      address: "Gedung Gorga, Jakarta",
      mapsUrl: "https://maps.app.goo.gl/WSsX9X17dp7qSwqh6",
      lat: -6.1806164,
      lng: 106.7798582,
      mapsCid: "3244947555986001362",
      startsAt: "2026-10-24T11:00:00+07:00",
      endsAt: "2026-10-24T15:00:00+07:00",
    },
  ] satisfies WeddingEvent[],

  story: {
    enabled: true,
    title: "Kisah Kami",
    subtitle: "Our Story",
    milestones: [
      {
        date: "Agustus 2022",
        title: "Pertama Bertemu",
        text: "Kami pertama kali bertemu di sebuah coffee shop di bilangan Jakarta Selatan.",
        photo: "",
      },
      {
        date: "Oktober 2022",
        title: "Awal Kisah Kami",
        text: "Geraldo menyatakan cintanya kepada Christin, dan sejak itu kisah kami dimulai.",
        photo: "",
      },
      {
        date: "Juli 2025",
        title: "Langkah Serius",
        text: "Geraldo menyampaikan niat tulusnya untuk menikahi Christin di hadapan kedua orang tua Christin.",
        photo: "",
      },
      {
        date: "April 2026",
        title: "Pertemuan Keluarga",
        text: "Keluarga Geraldo berkunjung ke kediaman keluarga Christin untuk memantapkan rencana pernikahan kami.",
        photo: "",
      },
      {
        date: "Oktober 2026",
        title: "Pertunangan",
        text: "Geraldo dan Christin resmi bertunangan.",
        photo: "",
      },
      {
        date: "24 Oktober 2026",
        title: "Hari Pernikahan",
        text: "Hari yang telah kami nantikan, saat kami mengikat janji suci pernikahan di hadapan Tuhan.",
        photo: "",
      },
    ] satisfies StoryMilestone[],
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
    /** @deprecated prefer qrisBride / qrisGroom */
    qris: "/assets/ballroom/qris-bride-v2.webp",
    qrisBride: "/assets/ballroom/qris-bride-v2.webp",
    qrisGroom: "/assets/ballroom/qris-groom-v2.webp",
    accounts: [
      {
        bank: "BCA",
        number: "2480419009",
        holder: "Christin Samosir",
        logo: "/assets/ballroom/bca-logo.png",
        side: "bride",
      },
      {
        bank: "BCA",
        number: "5271021641",
        holder: "Geraldo Gracedo Sudena",
        logo: "/assets/ballroom/bca-logo.png",
        side: "groom",
      },
    ] satisfies GiftAccount[],
  },

  hashtag: {
    title: "Photobooth",
    subtitle: "Abadikan Momenmu",
    tag: "#GeralDOanythingforChristine",
    lead: "feel free to use our template",
    storyTemplate: "/assets/ballroom/story-template.png",
    storyPreviewBg: "/assets/ballroom/gallery/01.webp",
    boothButton: "Rekam Video Story",
    boothMaxSeconds: 15,
    boothShare: "Bagikan ke Story",
    boothRetry: "Ulangi",
    boothDenied: "Kamera tidak tersedia. Bagikan foto template saja.",
    storyButton: "Bagikan Foto",
    /** Only under the Rekam Video Story button — do not reuse as lead/caption. */
    storyHint: "Panduan: klik rekam video story, lalu bagikan pilih Instagram → Story.",
    storyFallbackToast: "Tersimpan, buka Instagram lalu pilih dari galeri",
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
    heroVideo: "/assets/ballroom/hero.mp4",
    heroPoster: "/assets/ballroom/hero-poster.jpg",
    /** @deprecated canvas frame scrub replaced by heroVideo */
    heroFramesBase: "/assets/ballroom/hero-frames",
    heroFrameCount: 24,
  },

  rsvp: {
    title: "RSVP",
    subtitle: "Konfirmasi kehadiran Anda dengan mengisi form berikut",
    note: "*Mohon maaf! Khusus untuk tamu undangan",
    deadline: "2026-10-17T23:59:59+07:00",
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
    calendarFabLabel: "Tambah ke Kalender",
    calendarSaveAll: "Simpan ke Kalender",
  },

  giftUi: {
    openButton: "Hadiah",
    bankLabel: "Bank",
    accountNumberLabel: "No. Rekening —",
    accountHolderPrefix: "a.n",
    copyAccountButton: "Salin Nomor Rekening",
    copyAccountSuccess: "Nomor rekening tersalin",
    copyError: "Gagal menyalin",
  },

  footer: {
    creditPrefix: "© 2026.",
    creditBrand: "KlikMomen",
    portfolioPrompt: "",
    portfolioLinkLabel: "Portfolio",
    websiteAriaLabel: "Kunjungi portfolio pembuat undangan",
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
