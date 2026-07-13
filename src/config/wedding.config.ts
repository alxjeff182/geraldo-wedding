import {
  DEFAULT_INVITE_TEMPLATE_ID,
  INVITE_MESSAGE_TEMPLATES,
} from "./invite-templates";

export type WeddingEvent = {
  name: string;
  dateLabel: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
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
      instagramUrl: "https://jeff-interactive-resume.vercel.app/en",
    },
  },

  couple: {
    groom: {
      shortName: "Geraldo",
      fullName: "Geraldo Gracedo Sudena Tampubolon",
      instagram: "https://instagram.com/geraldo.gracedo",
      instagramHandle: "@geraldo.gracedo",
      photo: "/assets/images/groom-placeholder.svg",
    },
    bride: {
      shortName: "Christin",
      fullName: "Christin Samosir, S.M.",
      instagram: "https://instagram.com/christin.samosir",
      instagramHandle: "@christin.samosir",
      photo: "/assets/images/bride-placeholder.svg",
    },
  },

  date: "2026-04-25T08:00:00+07:00",
  dateLabel: "25 APRIL 2026",
  dateShort: "25 . 04 . 2026",
  location: "Tangerang",

  hero: {
    eyebrow: "The Wedding Of",
    groomName: "Geraldo Tampubolon",
    brideName: "Christin Samosir, S.M.",
  },

  intro:
    "Dengan memohon rahmat dan berkat Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami. Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan memberikan doa restu.",

  quote: "Constantly, consistently, continually, You.",

  bibleQuote:
    "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
  bibleReference: "Matius 19:6",

  events: [
    {
      name: "Pemberkatan",
      dateLabel: "Sabtu\n25 . 04 . 2026",
      time: "Pukul 08.00 WIB",
      venue: "GPI Pondok Arum",
      address:
        "Perum. Pondok Arum, Blok J No. 26, Kel. Pabuaran Tumpeng, Kec. Karawaci, Tangerang",
      mapsUrl: "https://share.google/grqB2yx9JoR0Cdkdq",
    },
    {
      name: "Resepsi & Adat",
      dateLabel: "Sabtu\n25 . 04 . 2026",
      time: "Pukul 11.00 WIB",
      venue: "UFIT HALL GK",
      address:
        "Jl. Palem Raja Raya No.31, Panunggangan Bar., Kec. Cibodas, Kab. Tangerang",
      mapsUrl: "https://share.google/xxDvbeTIhjN0hvbBg",
    },
  ] satisfies WeddingEvent[],

  gallery: {
    title: "Our Gallery",
    subtitle: "Constantly, consistently,\ncontinually, You.",
    images: [
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 1" },
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 2" },
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 3" },
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 4" },
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 5" },
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 6" },
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 7" },
      { src: "/assets/images/gallery-placeholder.svg", alt: "Foto prewedding 8" },
    ],
  },

  gift: {
    title: "Wedding Gift",
    description:
      "Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.",
    physicalAddress:
      "Perum. Taman Danau Indah Blok J No. 26, Kel. Pabuaran Tumpeng, Kec. Karawaci, Tangerang",
    accounts: [
      {
        bank: "BCA",
        number: "6705188657",
        holder: "Christin Samosir, S.M.",
        logo: "/assets/images/bca-logo.png",
      },
    ] satisfies GiftAccount[],
  },

  hashtag: {
    title: "Share Your Moments",
    tag: "#GeraldoChristin2026",
    photo: "/assets/images/hashtag-placeholder.svg",
  },

  closing: {
    paragraphs: [
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan do'a restunya untuk pernikahan kami.",
      "Atas do'a & restunya, kami ucapkan terima kasih.",
    ],
  },

  media: {
    coverBg: "/assets/images/batak-sampul.jpg",
    desktopBg: "/assets/images/DESIGN-BG-HOME-BATAK.jpg",
    paperBg: "/assets/images/paper-plos-p-1.jpg",
    rumahBolon: "/assets/images/rumah-olon.png",
    bunga: "/assets/images/2088186-bunga.png",
    divider: "/assets/images/divider-tema-maroon.png",
    closing: "/assets/images/closing-tema-batak.jpg",
    ulos: "/assets/images/ulos.jpg",
    heroPhoto: "/assets/images/hero-couple.png",
    portrait: "/assets/images/hero-couple.png",
    audio: "/assets/audio/toba-dream.mp3",
    video: "/assets/video/3D-motion-batak-compressed.mp4",
    ogImage: "/assets/images/batak-sampul.jpg",
  },

  rsvp: {
    title: "Rsvp",
    subtitle: "Konfirmasi kehadiran Anda dengan mengisi form berikut",
    note: "*Mohon maaf! Khusus untuk tamu undangan",
    nameLabel: "Nama*",
    namePlaceholder: "Nama Anda",
    attendanceLabel: "Konfirmasi Kehadiran*",
    attendanceAriaLabel: "Pilihan kehadiran",
    guestCountLabel: "Jumlah Kehadiran*",
    guestCountAriaLabel: "Jumlah kehadiran",
    guestCountPlaceholder: "Pilih",
    guestCountOptions: ["1", "2", "3"],
    submit: "Submit",
    submitting: "Mengirim...",
    defaultAttendance: "hadir",
    errorMessage: "Gagal mengirim RSVP. Silakan coba lagi.",
    successMessage: "Terima kasih! Konfirmasi kehadiran Anda telah kami terima.",
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
    attendanceTidak: "Tidak Hadir",
    attendanceRagu: "Ragu",
    statTotal: "Konfirmasi",
    statPeople: "Total Orang",
    statHadir: "Hadir",
    statTidak: "Tidak Hadir",
    liveUpdateMessage: "Konfirmasi RSVP baru masuk",
  },

  guestbook: {
    title: "Best Wishes",
    subtitle: "Sampaikan doa dan ucapan terbaik Anda",
    namePlaceholder: "Nama",
    messagePlaceholder: "Ucapan",
    submit: "Kirim",
    submitting: "Mengirim...",
    emptyMessage: "Belum ada ucapan. Jadilah yang pertama!",
    emptyNoSupabase: "Hubungkan Supabase untuk menampilkan buku tamu.",
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
    rumahBolonAlt: "Rumah Bolon — simbol adat Batak",
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
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },
  },

  eventsSection: {
    title: "Wedding\nEvent",
    titleEmbedded: "Wedding Event",
    subtitle: "Acara akan dilaksanakan pada:",
    venueLabel: "Bertempat di",
    venueLabelColon: "Bertempat di:",
    mapsButton: "Open Maps",
  },

  giftUi: {
    openButton: "Klik di sini",
    bankLabel: "Bank",
    accountNumberLabel: "No. Rekening —",
    accountHolderPrefix: "a.n",
    copyAccountButton: "Salin Nomor Rekening",
    physicalGiftTitle: "Kirim Kado",
    copyAddressButton: "Salin Alamat",
    copyAccountSuccess: "Nomor rekening berhasil disalin",
    copyAddressSuccess: "Alamat berhasil disalin",
    copyError: "Gagal menyalin",
  },

  footer: {
    creditPrefix: "Dibuat oleh",
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
    templatesSubtitle: "Pilih dan edit salah satu dari 10 template undangan. Setiap tamu bisa dikirim dengan template berbeda.",
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
    guestError: "Gagal menyimpan data tamu",
  },
} as const;

export type WeddingConfig = typeof wedding;
