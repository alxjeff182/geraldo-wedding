import { isSupabaseConfigured } from "./supabase-rest";

export type WaDeskGuest = {
  id: string;
  slug: string;
  display_name: string;
  phone: string | null;
  notes: string | null;
  invite_sent_at: string | null;
};

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function restHeaders(): HeadersInit {
  return {
    apikey: anonKey!,
    Authorization: `Bearer ${anonKey!}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    Prefer: "return=representation",
  };
}

function rpcUrl(name: string): string {
  return `${url!.replace(/\/$/, "")}/rest/v1/rpc/${name}`;
}

async function callRpc<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null; status: number }> {
  if (!isSupabaseConfigured || !url || !anonKey) {
    return { data: null, error: "Supabase tidak dikonfigurasi", status: 0 };
  }

  try {
    const res = await fetch(rpcUrl(name), {
      method: "POST",
      headers: restHeaders(),
      body: JSON.stringify(body),
    });

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      // PostgREST wraps raise exception as { message, code, ... }
      const message =
        data && typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: unknown }).message)
          : `HTTP ${res.status}`;
      if (/not_found|P0002/i.test(message) || res.status === 404) {
        return { data: null, error: "Link tidak valid", status: res.status };
      }
      return { data: null, error: message || `HTTP ${res.status}`, status: res.status };
    }

    return { data: data as T, error: null, status: res.status };
  } catch {
    return { data: null, error: "Gagal menghubungi server", status: 0 };
  }
}

export async function fetchWaDeskGuests(
  token: string,
): Promise<{ guests: WaDeskGuest[]; error: string | null }> {
  const { data, error } = await callRpc<WaDeskGuest[]>("wa_desk_list", { p_token: token });
  if (error) return { guests: [], error };
  return { guests: Array.isArray(data) ? data : [], error: null };
}

export async function markWaDeskGuestSent(
  token: string,
  guestId: string,
  sent: boolean,
): Promise<{ invite_sent_at: string | null; error: string | null }> {
  const { data, error } = await callRpc<{ id: string; invite_sent_at: string | null }>(
    "wa_desk_mark",
    {
      p_token: token,
      p_guest_id: guestId,
      p_sent: sent,
    },
  );
  if (error || !data) {
    return { invite_sent_at: null, error: error ?? "Gagal memperbarui status" };
  }
  return { invite_sent_at: data.invite_sent_at, error: null };
}
