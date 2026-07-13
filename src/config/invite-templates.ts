export type InviteMessageTemplate = {
  id: string;
  name: string;
  message: string;
};

export const INVITE_MESSAGE_TEMPLATES: InviteMessageTemplate[] = [
  {
    id: "formal-islami",
    name: "1. Formal Islami",
    message: `Assalamu'alaikum Warahmatullahi Wabarakatuh

{salam} {nama},

Dengan memohon rahmat dan berkat Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:

💍 {pasangan}
📅 {tanggal}
📍 {lokasi}

Mohon doa restu dan kehadiran Bapak/Ibu/Saudara/i di acara pernikahan kami.

Undangan digital:
{link}

Terima kasih 🙏
Wassalamu'alaikum`,
  },
  {
    id: "formal-nasional",
    name: "2. Formal Nasional",
    message: `{salam} {nama},

Dengan memohon rahmat dan berkat Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:

💍 {pasangan}
📅 {tanggal}
📍 {lokasi}

Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Silakan buka undangan melalui link berikut:
{link}

Atas perhatian dan doa restunya, kami ucapkan terima kasih.`,
  },
  {
    id: "singkat-sopan",
    name: "3. Singkat & Sopan",
    message: `Halo {nama} 👋

Kami mengundang Anda untuk hadir di pernikahan {pasangan}.

📅 {tanggal}
📍 {lokasi}

Detail undangan:
{link}

Terima kasih, sampai jumpa!`,
  },
  {
    id: "casual-ramah",
    name: "4. Casual Ramah",
    message: `Hai {nama}! 😊

Kami mau ngundang kamu buat datang ke pernikahan kami — {pasangan}!

📅 {tanggal}
📍 {lokasi}

Cek undangannya di sini ya:
{link}

Makasih banyak, ditunggu kehadirannya!`,
  },
  {
    id: "pagi-ceria",
    name: "5. Selamat Pagi",
    message: `Selamat pagi {salam} {nama} ☀️

Semoga hari Anda menyenangkan. Kami ingin mengundang Anda di acara pernikahan kami:

💍 {pasangan}
📅 {tanggal}
📍 {lokasi}

Link undangan:
{link}

Terima kasih dan sampai bertemu!`,
  },
  {
    id: "siang-santun",
    name: "6. Selamat Siang",
    message: `Selamat siang {salam} {nama},

Perkenankan kami mengundang Bapak/Ibu/Saudara/i di acara pernikahan:

💍 {pasangan}
📅 {tanggal}
📍 {lokasi}

Undangan digital:
{link}

Mohon doa dan kehadirannya. Terima kasih.`,
  },
  {
    id: "malam-elegan",
    name: "7. Selamat Malam",
    message: `Selamat malam {salam} {nama} 🌙

Dengan penuh sukacita, kami mengundang Anda untuk merayakan pernikahan kami:

💍 {pasangan}
📅 {tanggal}
📍 {lokasi}

Silakan akses undangan melalui:
{link}

Merupakan kebahagiaan bagi kami jika Anda dapat hadir.`,
  },
  {
    id: "save-the-date",
    name: "8. Save The Date",
    message: `📌 SAVE THE DATE

{salam} {nama},

Kami akan menikah! 💒

{pasangan}
📅 {tanggal}
📍 {lokasi}

Simpan tanggalnya ya. Undangan lengkap ada di:
{link}

Sampai jumpa di hari bahagia kami!`,
  },
  {
    id: "pengingat",
    name: "9. Pengingat Undangan",
    message: `{salam} {nama},

Ini pengingat undangan pernikahan {pasangan} yang akan diselenggarakan:

📅 {tanggal}
📍 {lokasi}

Jika belum sempat membuka, berikut link undangannya:
{link}

Mohon konfirmasi kehadiran melalui form RSVP di undangan. Terima kasih! 🙏`,
  },
  {
    id: "keluarga-dekat",
    name: "10. Keluarga Dekat",
    message: `{nama}, halo! 👋

Sebagai keluarga/kolega dekat, kami ingin mengundang Anda secara langsung ke pernikahan kami — {pasangan}.

📅 {tanggal}
📍 {lokasi}

Ini link undangan personal Anda:
{link}

Kehadiran Anda sangat berarti bagi kami. Sampai jumpa!`,
  },
];

export const DEFAULT_INVITE_TEMPLATE_ID = INVITE_MESSAGE_TEMPLATES[0].id;

export function resolveInviteTemplates(
  templates: InviteMessageTemplate[] | undefined,
  legacySingle?: string,
): InviteMessageTemplate[] {
  if (templates && templates.length > 0) return templates;

  if (legacySingle?.trim()) {
    return [{ id: "legacy", name: "Template Kustom", message: legacySingle }];
  }

  return INVITE_MESSAGE_TEMPLATES;
}

export function getInviteTemplateById(
  templates: InviteMessageTemplate[],
  id: string,
): InviteMessageTemplate {
  return templates.find((item) => item.id === id) ?? templates[0];
}
