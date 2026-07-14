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
