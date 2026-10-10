import { useEffect, useState } from "react";
import { resolveInviteSlug } from "../lib/invite-links";

function firstRow<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null;
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export function useGuestName() {
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [inviteSlug, setInviteSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const { slug, fromLegacyTo } = resolveInviteSlug(params);

    if (!slug) {
      setLoading(false);
      return;
    }

    setInviteSlug(slug);

    void (async () => {
      const { getSupabase, isSupabaseConfigured } = await import("../lib/supabase");

      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: found } = await supabase.rpc("get_guest_by_slug", {
        guest_slug: slug,
      });
      const row = firstRow(found);

      if (row?.id) {
        setGuestName(row.display_name || "Tamu Undangan");
        setGuestId(row.id);

        if (fromLegacyTo || params.get("guest") !== slug) {
          const next = new URLSearchParams(params);
          next.delete("to");
          next.set("guest", slug);
          const qs = next.toString();
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
          );
        }
      }
      // Unknown slug → treat as public invite (no guestId).
      setLoading(false);
    })();
  }, []);

  return { guestName, guestId, inviteSlug, loading };
}
