import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = (origin: string | null, allowedOrigin: string | null) => ({
  "Access-Control-Allow-Origin": allowedOrigin && origin ? origin : allowedOrigin ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

const MAX_NAME = 200;
const MAX_WISH_MESSAGE = 500;
const MAX_RSVP_PER_HOUR = 5;
const MAX_WISH_PER_HOUR = 10;
const MAX_WISH_PER_GUEST = 3;
const MIN_RSVP_INTERVAL_MS = 30_000;
const MIN_WISH_GUEST_INTERVAL_MS = 60_000;
const MIN_FORM_MS = 3_000;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

const BAD_WORDS = [
  "anjing",
  "bangsat",
  "bajingan",
  "kontol",
  "memek",
  "ngentot",
  "asu",
  "fuck",
  "shit",
  "bitch",
  "asshole",
];

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

function normalizeWishText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSpammyMessage(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return "Data ucapan tidak valid";
  if (trimmed.length > MAX_WISH_MESSAGE) {
    return "Ucapan terlalu panjang (maks. 500 karakter).";
  }

  const letters = (trimmed.match(/[a-zA-Z\u00C0-\u024F]/g) ?? []).length;
  if (letters < 3) return "Ucapan terlalu pendek.";

  if (/https?:\/\/|www\.|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) {
    return "Ucapan berisi tautan atau nomor tidak diperbolehkan.";
  }
  if (/\d[\d\s().-]{7,}\d/.test(trimmed) || (trimmed.match(/\d/g) ?? []).length >= 9) {
    return "Ucapan berisi tautan atau nomor tidak diperbolehkan.";
  }
  if (/(.)\1{5,}/.test(trimmed)) return "Ucapan tidak valid.";

  const normalized = normalizeWishText(trimmed);
  if (BAD_WORDS.some((word) => new RegExp(`(?:^|\\s)${word}(?:$|\\s)`).test(normalized))) {
    return "Ucapan mengandung kata yang tidak pantas.";
  }

  return null;
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
      if (!isValidFormTiming(formOpenedAt)) {
        return fakeOk(headers);
      }

      const message = sanitizeString(payload?.message, MAX_WISH_MESSAGE);
      let guestId = isUuid(payload?.guest_id) ? payload.guest_id : null;
      const guestSlugRaw = typeof payload?.guest_slug === "string" ? payload.guest_slug : "";
      const guestSlug = guestSlugRaw
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
      const payloadName = sanitizeString(payload?.name, MAX_NAME);

      if (!message) {
        return new Response(JSON.stringify({ error: "Data ucapan tidak valid" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (!guestId && guestSlug.length < 2) {
        return new Response(JSON.stringify({ error: "Buka undangan dari link pribadi Anda untuk mengirim ucapan." }), {
          status: 403,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const spamReason = isSpammyMessage(message);
      if (spamReason) {
        return new Response(JSON.stringify({ error: spamReason }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      let guest: { id: string; display_name: string } | null = null;

      if (guestId) {
        const { data, error: guestError } = await supabase
          .from("guests")
          .select("id, display_name")
          .eq("id", guestId)
          .maybeSingle();
        if (guestError) throw guestError;
        guest = data;
      }

      if (!guest && guestSlug.length >= 2) {
        const displayName =
          payloadName ||
          guestSlug
            .split("-")
            .filter(Boolean)
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
        const { data: upserted, error: upsertError } = await supabase
          .from("guests")
          .upsert(
            { slug: guestSlug, display_name: displayName },
            { onConflict: "slug" },
          )
          .select("id, display_name")
          .maybeSingle();
        if (upsertError) throw upsertError;
        guest = upserted;
        guestId = upserted?.id ?? null;
      }

      if (!guest?.id || !guest.display_name || !guestId) {
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
        return new Response(JSON.stringify({ error: "Batas 3 ucapan per undangan sudah tercapai." }), {
          status: 429,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const latest = wishRows[0];
      if (latest?.created_at) {
        const elapsed = Date.now() - new Date(latest.created_at).getTime();
        if (elapsed < MIN_WISH_GUEST_INTERVAL_MS) {
          return new Response(JSON.stringify({ error: "Tunggu sebentar sebelum mengirim ucapan lagi." }), {
            status: 429,
            headers: { ...headers, "Content-Type": "application/json" },
          });
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
        return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }), {
          status: 429,
          headers: { ...headers, "Content-Type": "application/json" },
        });
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
