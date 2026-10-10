import type { SiteContentOverrides } from "../types/site-content";
import type { RsvpInsert, Wish, WishInsert } from "./supabase";

export type { Wish } from "./supabase";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

function restHeaders(extra?: HeadersInit): HeadersInit {
  return {
    apikey: anonKey!,
    Authorization: `Bearer ${anonKey!}`,
    ...extra,
  };
}

function restUrl(path: string, query?: Record<string, string>): string {
  const base = url!.replace(/\/$/, "");
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  return `${base}/rest/v1/${path}${qs}`;
}

export type GuestBySlugRow = { id: string; display_name: string };

export async function fetchSiteContentMain(): Promise<{
  content: SiteContentOverrides | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    return { content: null, error: null };
  }

  const res = await fetch(
    restUrl("site_content", { id: "eq.main", select: "content" }),
    { headers: restHeaders({ Accept: "application/json" }) },
  );

  if (!res.ok) {
    return { content: null, error: `Gagal memuat konten (${res.status})` };
  }

  const rows = (await res.json()) as { content?: SiteContentOverrides }[];
  const row = rows[0];
  if (row?.content && typeof row.content === "object") {
    return { content: row.content, error: null };
  }
  return { content: null, error: null };
}

export async function getGuestBySlug(slug: string): Promise<GuestBySlugRow | null> {
  if (!isSupabaseConfigured || !slug.trim()) return null;

  const res = await fetch(restUrl("rpc/get_guest_by_slug"), {
    method: "POST",
    headers: restHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    body: JSON.stringify({ guest_slug: slug }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as GuestBySlugRow | GuestBySlugRow[] | null;
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row?.id ? row : null;
}

export async function fetchPublicWishes(): Promise<{ data: Wish[] | null; error: boolean }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: true };
  }

  const res = await fetch(
    restUrl("wishes", {
      select: "id,guest_id,name,message,attendance,created_at",
      hidden: "eq.false",
      order: "created_at.desc",
      limit: "50",
    }),
    { headers: restHeaders({ Accept: "application/json" }) },
  );

  if (!res.ok) {
    return { data: null, error: true };
  }

  const data = (await res.json()) as Wish[];
  return { data, error: false };
}

export type SubmitBody = {
  type: "rsvp" | "wish";
  payload: RsvpInsert | WishInsert;
  honeypot?: string;
  companyHoneypot?: string;
  formOpenedAt?: number;
};

export async function invokeSubmitFunction(
  body: SubmitBody,
): Promise<{ data: unknown; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: "Supabase tidak dikonfigurasi" };
  }

  const functionsUrl = `${url!.replace(/\/$/, "")}/functions/v1/submit`;
  const res = await fetch(functionsUrl, {
    method: "POST",
    headers: restHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data && data.error
        ? String((data as { error: unknown }).error)
        : `HTTP ${res.status}`;
    return { data, error: message };
  }

  return { data, error: null };
}
