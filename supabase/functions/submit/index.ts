import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

const MAX_NAME = 200;
const MAX_MESSAGE = 2000;
const MAX_RSVP_PER_HOUR = 20;
const MAX_WISH_PER_HOUR = 30;

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function sanitizeString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  ip: string,
  action: string,
  limit: number,
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("action", action)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= limit) return false;

  await supabase.from("rate_limits").insert({ ip, action });
  return true;
}

serve(async (req) => {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? null;
  const headers = corsHeaders(allowedOrigin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { type, payload, honeypot } = await req.json();

    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();

    if (type === "rsvp") {
      const name = sanitizeString(payload?.name, MAX_NAME);
      const guestCount = Number(payload?.guest_count);
      const attendance = payload?.attendance;
      const guestId = payload?.guest_id ?? null;

      if (!name || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 3) {
        return new Response(JSON.stringify({ error: "Data RSVP tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (attendance !== "hadir" && attendance !== "tidak_hadir" && attendance !== "ragu") {
        return new Response(JSON.stringify({ error: "Kehadiran tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (guestId !== null && !isUuid(guestId)) {
        return new Response(JSON.stringify({ error: "Tamu tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const allowed = await checkRateLimit(supabase, ip, "rsvp", MAX_RSVP_PER_HOUR);
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }), {
          status: 429,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("rsvp_submissions").insert({
        guest_id: guestId,
        name,
        guest_count: guestCount,
        attendance,
      });

      if (error) throw error;
    } else if (type === "wish") {
      const name = sanitizeString(payload?.name, MAX_NAME);
      const message = sanitizeString(payload?.message, MAX_MESSAGE);
      const guestId = payload?.guest_id ?? null;

      if (!name || !message) {
        return new Response(JSON.stringify({ error: "Data ucapan tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (guestId !== null && !isUuid(guestId)) {
        return new Response(JSON.stringify({ error: "Tamu tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const allowed = await checkRateLimit(supabase, ip, "wish", MAX_WISH_PER_HOUR);
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }), {
          status: 429,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("wishes").insert({
        guest_id: guestId,
        name,
        message,
      });

      if (error) throw error;
    } else {
      return new Response(JSON.stringify({ error: "Tipe permintaan tidak valid" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Terjadi kesalahan server" }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
