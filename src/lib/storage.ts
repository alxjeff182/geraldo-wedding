import { getSupabase } from "./supabase";

const BUCKET = "wedding-media";

export function getPublicMediaUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  const supabase = getSupabase();
  if (!supabase) return path;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMediaFile(file: File, folder: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase tidak dikonfigurasi");

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
