import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { SiteContentOverrides } from "../types/site-content";

export type Guest = {
  id: string;
  slug: string;
  display_name: string;
};

export type RsvpSubmission = {
  id: string;
  guest_id: string | null;
  name: string;
  gender: string | null;
  city: string | null;
  attendance: "hadir" | "tidak_hadir" | "ragu";
  guest_count: number;
  created_at: string;
};

export type Wish = {
  id: string;
  guest_id: string | null;
  name: string;
  message: string;
  attendance: "hadir" | "tidak_hadir" | "ragu" | null;
  created_at: string;
};

export type RsvpInsert = {
  guest_id?: string | null;
  name: string;
  gender?: string | null;
  city?: string | null;
  attendance: "hadir" | "tidak_hadir" | "ragu";
  guest_count?: number;
};

export type WishInsert = {
  guest_id?: string | null;
  name: string;
  message: string;
  attendance?: "hadir" | "tidak_hadir" | "ragu" | null;
};

export type SiteContentRow = {
  id: string;
  content: SiteContentOverrides;
  updated_at: string;
};

export type WeddingDatabase = {
  public: {
    Tables: {
      guests: {
        Row: Guest;
        Insert: { slug: string; display_name: string };
        Update: Partial<Guest>;
        Relationships: [];
      };
      site_content: {
        Row: SiteContentRow;
        Insert: { id?: string; content: SiteContentOverrides; updated_at?: string };
        Update: { content?: SiteContentOverrides; updated_at?: string };
        Relationships: [];
      };
      rsvp_submissions: {
        Row: RsvpSubmission;
        Insert: RsvpInsert;
        Update: Partial<RsvpSubmission>;
        Relationships: [];
      };
      wishes: {
        Row: Wish;
        Insert: WishInsert;
        Update: Partial<Wish>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_guest_by_slug: {
        Args: { guest_slug: string };
        Returns: { id: string; display_name: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient<WeddingDatabase> | null = null;

export function getSupabase(): SupabaseClient<WeddingDatabase> | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient<WeddingDatabase>(url!, anonKey!);
  }
  return client;
}
