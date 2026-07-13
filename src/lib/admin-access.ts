import { getSupabase } from "./supabase";

export async function checkAdminAccess(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}
