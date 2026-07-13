import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { RsvpInsert, WishInsert } from "./supabase";
import type { GuestbookContent, RsvpContent } from "../types/site-content";

type SubmitMessages = {
  success?: string;
  localSuccess?: string;
  networkError?: string;
  supabaseError?: string;
};

type SubmitRsvp = {
  type: "rsvp";
  honeypot?: string;
  companyHoneypot?: string;
  formOpenedAt?: number;
  payload: RsvpInsert;
  messages?: Pick<
    RsvpContent,
    "successMessage" | "localSuccessMessage" | "networkErrorMessage" | "supabaseErrorMessage"
  >;
};

type SubmitWish = {
  type: "wish";
  honeypot?: string;
  payload: WishInsert;
  messages?: Pick<
    GuestbookContent,
    "successMessage" | "localSuccessMessage" | "networkErrorMessage" | "supabaseErrorMessage"
  >;
};

export type SubmitFormInput = SubmitRsvp | SubmitWish;

type SubmitResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

function pickMessages(input: SubmitFormInput): SubmitMessages {
  if (!input.messages) return {};

  if (input.type === "rsvp") {
    return {
      success: input.messages.successMessage,
      localSuccess: input.messages.localSuccessMessage,
      networkError: input.messages.networkErrorMessage,
      supabaseError: input.messages.supabaseErrorMessage,
    };
  }

  return {
    success: input.messages.successMessage,
    localSuccess: input.messages.localSuccessMessage,
    networkError: input.messages.networkErrorMessage,
    supabaseError: input.messages.supabaseErrorMessage,
  };
}

export async function submitForm(input: SubmitFormInput): Promise<SubmitResult> {
  const messages = pickMessages(input);

  if (!isSupabaseConfigured) {
    return {
      ok: true,
      message:
        messages.localSuccess ??
        (input.type === "rsvp"
          ? "RSVP tersimpan secara lokal (hubungkan Supabase untuk penyimpanan)"
          : "Ucapan tersimpan secara lokal (hubungkan Supabase untuk penyimpanan)"),
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: messages.supabaseError ?? "Supabase tidak tersedia" };
  }

  const { data, error } = await supabase.functions.invoke("submit", {
    body: input,
  });

  if (error) {
    return { ok: false, error: messages.networkError ?? "Gagal mengirim. Silakan coba lagi." };
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    return { ok: false, error: String(data.error) };
  }

  return {
    ok: true,
    message:
      messages.success ??
      (input.type === "rsvp"
        ? "Terima kasih! Konfirmasi kehadiran Anda telah kami terima."
        : "Terima kasih atas ucapan Anda!"),
  };
}
