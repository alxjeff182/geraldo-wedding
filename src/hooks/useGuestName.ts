import { useEffect, useState } from "react";
import { decodeGuestName } from "../lib/guest-name";

export function useGuestName() {
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get("to");
    const guestSlug = params.get("guest");

    if (toParam) {
      setGuestName(decodeGuestName(toParam));
      setLoading(false);
      return;
    }

    if (!guestSlug) {
      setLoading(false);
      return;
    }

    void (async () => {
      const { getSupabase, isSupabaseConfigured } = await import("../lib/supabase");

      if (!isSupabaseConfigured) {
        setGuestName(guestSlug.replace(/-/g, " "));
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setGuestName(guestSlug.replace(/-/g, " "));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_guest_by_slug", {
        guest_slug: guestSlug,
      });

      const row = Array.isArray(data) ? data[0] : null;

      if (!error && row) {
        setGuestName(row.display_name);
        setGuestId(row.id);
      } else {
        setGuestName(guestSlug.replace(/-/g, " "));
      }
      setLoading(false);
    })();
  }, []);

  return { guestName, guestId, loading };
}
