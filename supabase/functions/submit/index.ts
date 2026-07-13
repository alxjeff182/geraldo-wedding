import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = (origin: string | null, allowedOrigin: string | null) => ({
  "Access-Control-Allow-Origin": allowedOrigin && origin ? origin : allowedOrigin ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

const MAX_NAME = 200;
const MAX_MESSAGE = 2000;
const MAX_RSVP_PER_HOUR = 5;
const MAX_WISH_PER_HOUR = 30;
const MIN_RSVP_INTERVAL_MS = 30_000;
const MIN_FORM_MS = 3_000;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

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

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function isSpammyName(name: string): boolean {
  const trimmed = name.trim();
  const lowered = trimmed.toLowerCase();
  if (/https?:\/\/|www\.|\.[a-z]{2,}\//i.test(lowered)) return true;
  if (/(.)\1{5,}/.test(trimmed)) return true;
  if ((trimmed.match(/[a-zA-Z]/g) ?? []).length < 2) return true;
  return false;
}

function isValidFormTiming(formOpenedAt: unknown): boolean {
  if (typeof formOpenedAt !== "number" || !Number.isFinite(formOpenedAt)) return false;
  const age = Date.now() - formOpenedAt;
  if (formOpenedAt > Date.now() + 1_000) return false;
  return age >= MIN_FORM_MS && age <= MAX_FORM_AGE_MS;
}

function fakeOk(headers: Record<string, string>) {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function isAllowedOrigin(req: Request, allowedOrigin: string | null): boolean {
  if (!allowedOrigin) return true;

  const normalizedAllowed = allowedOrigin.replace(/\/$/, "");
  const origin = req.headers.get("Origin");
  const referer = req.headers.get("Referer");

  if (origin) return origin === normalizedAllowed || origin.startsWith(`${normalizedAllowed}/`);
  if (referer) return referer.startsWith(normalizedAllowed);

  return false;
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

  if (!isAllowedOrigin(req, allowedOrigin)) {
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
      const guestId = payload?.guest_id ?? null;

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

      if (guestId !== null && !isUuid(guestId)) {
        return new Response(JSON.stringify({ error: "Tamu tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (guestId && (await guestAlreadySubmitted(supabase, guestId))) {
        return new Response(JSON.stringify({ error: "Konfirmasi kehadiran untuk undangan ini sudah pernah dikirim." }), {
          status: 409,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (await duplicateNameRecently(supabase, name)) {
        return new Response(JSON.stringify({ error: "Konfirmasi dengan nama ini sudah pernah dikirim hari ini." }), {
          status: 409,
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
        guest_count: attendance === "tidak_hadir" ? 1 : guestCount,
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
