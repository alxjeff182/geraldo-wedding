import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  MAX_NAME,
  MAX_WISH_MESSAGE,
  isAllowedOrigin,
  isSpammyMessage,
  isSpammyName,
  isUuid,
  isValidFormTiming,
  normalizeName,
  sanitizeString,
} from "./validate.ts";

const corsHeaders = (origin: string | null, allowedOrigin: string | null) => ({
  "Access-Control-Allow-Origin": allowedOrigin && origin ? origin : (allowedOrigin ?? "*"),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

const MAX_RSVP_PER_HOUR = 5;
const MAX_WISH_PER_HOUR = 10;
const MAX_WISH_PER_GUEST = 3;
const MIN_RSVP_INTERVAL_MS = 30_000;
const MIN_WISH_GUEST_INTERVAL_MS = 60_000;

function fakeOk(headers: Record<string, string>) {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

async function cleanupRateLimits(supabase: ReturnType<typeof createClient>) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("rate_limits").delete().lt("created_at", cutoff);
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  ip: string,
  action: string,
  limit: number,
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: latest } = await supabase
    .from("rate_limits")
    .select("created_at")
    .eq("ip", ip)
    .eq("action", action)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest?.created_at) {
    const elapsed = Date.now() - new Date(latest.created_at).getTime();
    if (elapsed < MIN_RSVP_INTERVAL_MS) return false;
  }

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

async function guestAlreadySubmitted(
  supabase: ReturnType<typeof createClient>,
  guestId: string,
): Promise<boolean> {
  const { count } = await supabase
    .from("rsvp_submissions")
    .select("*", { count: "exact", head: true })
    .eq("guest_id", guestId);

  return (count ?? 0) > 0;
}

async function duplicateNameRecently(
  supabase: ReturnType<typeof createClient>,
  name: string,
): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const normalized = normalizeName(name);

  const { data } = await supabase
    .from("rsvp_submissions")
    .select("name")
    .gte("created_at", since)
    .ilike("name", name.trim());

  return (data ?? []).some((row) => normalizeName(row.name) === normalized);
}

serve(async (req) => {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? null;
  const requestOrigin = req.headers.get("Origin");
  const headers = corsHeaders(requestOrigin, allowedOrigin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (!isAllowedOrigin(requestOrigin, req.headers.get("Referer"), allowedOrigin)) {
    return new Response(JSON.stringify({ error: "Origin tidak diizinkan" }), {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const { type, payload, honeypot, companyHoneypot, formOpenedAt } = await req.json();

    if (honeypot || companyHoneypot) {
      return fakeOk(headers);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await cleanupRateLimits(supabase);

    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();

    if (type === "rsvp") {
      if (!isValidFormTiming(formOpenedAt)) {
        return fakeOk(headers);
      }

      const name = sanitizeString(payload?.name, MAX_NAME);
      const guestCount = Number(payload?.guest_count);
      const attendance = payload?.attendance;
      const guestId = isUuid(payload?.guest_id) ? payload.guest_id : null;

      if (!guestId) {
        return new Response(
          JSON.stringify({
            error: "Buka undangan dari link pribadi Anda untuk konfirmasi kehadiran.",
          }),
          { status: 403, headers: { ...headers, "Content-Type": "application/json" } },
        );
      }

      const { data: rsvpGuest, error: rsvpGuestError } = await supabase
        .from("guests")
        .select("id")
        .eq("id", guestId)
        .maybeSingle();
      if (rsvpGuestError) throw rsvpGuestError;
      if (!rsvpGuest?.id) {
        return new Response(JSON.stringify({ error: "Tamu tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (!name || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 3) {
        return new Response(JSON.stringify({ error: "Data RSVP tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (isSpammyName(name)) {
        return new Response(JSON.stringify({ error: "Nama tidak valid" }), {
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

      if (await guestAlreadySubmitted(supabase, guestId)) {
        return new Response(
          JSON.stringify({
            error: "Konfirmasi kehadiran untuk undangan ini sudah pernah dikirim.",
          }),
          {
            status: 409,
            headers: { ...headers, "Content-Type": "application/json" },
          },
        );
      }

      if (await duplicateNameRecently(supabase, name)) {
        return new Response(
          JSON.stringify({ error: "Konfirmasi dengan nama ini sudah pernah dikirim hari ini." }),
          {
            status: 409,
            headers: { ...headers, "Content-Type": "application/json" },
          },
        );
      }

      const allowed = await checkRateLimit(supabase, ip, "rsvp", MAX_RSVP_PER_HOUR);
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }),
          {
            status: 429,
            headers: { ...headers, "Content-Type": "application/json" },
          },
        );
      }

      const { error } = await supabase.from("rsvp_submissions").insert({
        guest_id: guestId,
        name,
        guest_count: attendance === "tidak_hadir" ? 1 : guestCount,
        attendance,
      });

      if (error) throw error;
    } else if (type === "wish") {
      if (!isValidFormTiming(formOpenedAt)) {
        return fakeOk(headers);
      }

      const message = sanitizeString(payload?.message, MAX_WISH_MESSAGE);
      const guestId = isUuid(payload?.guest_id) ? payload.guest_id : null;

      if (!message) {
        return new Response(JSON.stringify({ error: "Data ucapan tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (!guestId) {
        return new Response(
          JSON.stringify({ error: "Buka undangan dari link pribadi Anda untuk mengirim ucapan." }),
          { status: 403, headers: { ...headers, "Content-Type": "application/json" } },
        );
      }

      const spamReason = isSpammyMessage(message);
      if (spamReason) {
        return new Response(JSON.stringify({ error: spamReason }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .select("id, display_name")
        .eq("id", guestId)
        .maybeSingle();
      if (guestError) throw guestError;

      if (!guest?.id || !guest.display_name) {
        return new Response(JSON.stringify({ error: "Tamu tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const { data: recentWishes, error: countError } = await supabase
        .from("wishes")
        .select("message, created_at")
        .eq("guest_id", guestId)
        .order("created_at", { ascending: false });

      if (countError) throw countError;

      const wishRows = recentWishes ?? [];
      if (wishRows.length >= MAX_WISH_PER_GUEST) {
        return new Response(
          JSON.stringify({ error: "Batas 3 ucapan per undangan sudah tercapai." }),
          {
            status: 429,
            headers: { ...headers, "Content-Type": "application/json" },
          },
        );
      }

      const latest = wishRows[0];
      if (latest?.created_at) {
        const elapsed = Date.now() - new Date(latest.created_at).getTime();
        if (elapsed < MIN_WISH_GUEST_INTERVAL_MS) {
          return new Response(
            JSON.stringify({ error: "Tunggu sebentar sebelum mengirim ucapan lagi." }),
            {
              status: 429,
              headers: { ...headers, "Content-Type": "application/json" },
            },
          );
        }
      }

      if (wishRows.some((row) => normalizeName(row.message) === normalizeName(message))) {
        return new Response(JSON.stringify({ error: "Ucapan yang sama sudah pernah dikirim." }), {
          status: 409,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const allowed = await checkRateLimit(supabase, ip, "wish", MAX_WISH_PER_HOUR);
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }),
          {
            status: 429,
            headers: { ...headers, "Content-Type": "application/json" },
          },
        );
      }

      const { error } = await supabase.from("wishes").insert({
        guest_id: guestId,
        name: guest.display_name,
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
