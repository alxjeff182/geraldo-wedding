import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { RsvpInsert, WishInsert } from "./supabase";

type SubmitRsvp = {
  type: "rsvp";
  honeypot?: string;
  payload: RsvpInsert;
};

type SubmitWish = {
  type: "wish";
  honeypot?: string;
  payload: WishInsert;
};

export type SubmitFormInput = SubmitRsvp | SubmitWish;

type SubmitResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

export async function submitForm(input: SubmitFormInput): Promise<SubmitResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: true,
      message:
        input.type === "rsvp"
          ? "RSVP tersimpan secara lokal (hubungkan Supabase untuk penyimpanan)"
          : "Ucapan tersimpan secara lokal (hubungkan Supabase untuk penyimpanan)",
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: "Supabase tidak tersedia" };
  }

  const { data, error } = await supabase.functions.invoke("submit", {
    body: input,
  });

  if (error) {
    return { ok: false, error: "Gagal mengirim. Silakan coba lagi." };
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    return { ok: false, error: String(data.error) };
  }

  return {
    ok: true,
    message:
      input.type === "rsvp"
        ? "Terima kasih! Konfirmasi kehadiran Anda telah kami terima."
        : "Terima kasih atas ucapan Anda!",
  };
}
