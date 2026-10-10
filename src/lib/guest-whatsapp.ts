import { buildWhatsAppUrl, normalizePhoneForWhatsApp } from "./invite-links";

export type RsvpWhatsappVars = {
  nama: string;
  kehadiran: string;
  jumlah: string;
  ucapan: string;
  pasangan: string;
};

export type GiftWhatsappVars = {
  nama: string;
  metode: string;
  pasangan: string;
};

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

export function buildRsvpWhatsappMessage(template: string, vars: RsvpWhatsappVars): string {
  return fillTemplate(template, {
    nama: vars.nama,
    kehadiran: vars.kehadiran,
    jumlah: vars.jumlah,
    ucapan: vars.ucapan ? `\nUcapan: ${vars.ucapan}` : "",
    pasangan: vars.pasangan,
  });
}

export function buildGiftWhatsappMessage(template: string, vars: GiftWhatsappVars): string {
  return fillTemplate(template, {
    nama: vars.nama,
    metode: vars.metode,
    pasangan: vars.pasangan,
  });
}

export function buildGuestWhatsAppUrl(phone: string, message: string): string | null {
  return buildWhatsAppUrl(phone, message);
}

export function isValidWhatsAppPhone(phone: string): boolean {
  return Boolean(normalizePhoneForWhatsApp(phone));
}
