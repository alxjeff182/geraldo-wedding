export type InviteMessageTemplate = {
  id: string;
  name: string;
  message: string;
};

export const INVITE_MESSAGE_TEMPLATES: InviteMessageTemplate[] = [
  {
    id: "formal-kristen",
    name: "1. Formal Kristen",
    message: `Shalom,

{salam} {nama},

Dengan penuh sukacita dan mengucap syukur kepada Tuhan Yesus Kristus, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam pemberkatan pernikahan kami:

💍 {pasangan}
📅 {tanggal}
📍 {lokasi}

Kami berharap kehadiran dan doa Bapak/Ibu/Saudara/i menjadi berkat bagi kami.

Undangan digital:
{link}

Tuhan memberkati 🙏`,
  },
  {
    id: "formal-nasional",
    name: "2. Formal Sopan",
    message: `{salam} {nama},

Dengan memohon berkat Tuhan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:

💍 {pasangan}
📅 {tanggal}
📍 {lokasi}

Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir dan mendoakan kami.

Silakan buka undangan melalui link berikut:
{link}

Atas perhatian dan doanya, kami ucapkan terima kasih.
Tuhan memberkati.`,
  },
  {
    id: "singkat-sopan",
    name: "3. Singkat & Sopan",
    message: `Halo {nama} 👋

Dengan sukacita kami mengundang Anda untuk hadir di pemberkatan pernikahan {pasangan}.

📅 {tanggal}
📍 {lokasi}

Detail undangan:
{link}

Tuhan memberkati, sampai jumpa!`,
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
