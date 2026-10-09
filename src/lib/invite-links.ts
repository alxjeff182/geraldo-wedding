export type InviteTemplateVars = {
  nama: string;
  link: string;
  tanggal: string;
  lokasi: string;
  pasangan: string;
  salam: string;
  slug: string;
  acara?: string;
  venue?: string;
};

export const INVITE_TEMPLATE_VARIABLES = [
  { key: "nama", label: "Nama tamu" },
  { key: "link", label: "Link undangan personal" },
  { key: "tanggal", label: "Label tanggal acara" },
  { key: "lokasi", label: "Lokasi / kota" },
  { key: "pasangan", label: "Nama mempelai" },
  { key: "salam", label: "Salam pembuka" },
  { key: "slug", label: "Slug tamu" },
  { key: "acara", label: "Ringkasan acara & jam" },
  { key: "venue", label: "Nama venue" },
] as const;

export function slugifyGuestName(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "tamu"
  );
}

export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return phone;
  if (normalized.startsWith("62") && normalized.length >= 10) {
    return `+${normalized}`;
  }
  return phone;
}

export function buildGuestInviteUrl(siteUrl: string, slug: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/?guest=${encodeURIComponent(slug)}`;
}

/**
 * Canonical invite param is `guest=<slug>`.
 * Legacy `to=<name>` is accepted and normalized to the same slug lookup.
 */
export function resolveInviteSlug(search: URLSearchParams): {
  slug: string | null;
  displayFallback: string | null;
  fromLegacyTo: boolean;
} {
  const guest = search.get("guest")?.trim();
  if (guest) {
    return { slug: guest, displayFallback: guest.replace(/-/g, " "), fromLegacyTo: false };
  }

  const to = search.get("to")?.trim();
  if (!to) {
    return { slug: null, displayFallback: null, fromLegacyTo: false };
  }

  let decoded = to;
  try {
    decoded = decodeURIComponent(to.replace(/\+/g, " "));
  } catch {
    decoded = to;
  }

  return {
    slug: slugifyGuestName(decoded),
    displayFallback: decoded,
    fromLegacyTo: true,
  };
}

export function formatInviteMessage(template: string, vars: InviteTemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key as keyof InviteTemplateVars];
    return value ?? `{${key}}`;
  });
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
