export const BULK_INSERT_CHUNK = 50;

export const PAGE_SIZES = [10, 15, 25, 50] as const;

export type GuestDraft = {
  display_name: string;
  phone: string;
};

export type SortKey = "name" | "phone" | "template" | "created";
export type SortDir = "asc" | "desc";
export type SentFilter = "all" | "unsent" | "sent";

export const emptyGuestDraft = (): GuestDraft => ({
  display_name: "",
  phone: "",
});

export function formatInviteLabel(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

export function truncate(text: string, max = 72): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

export function formatGuestDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
