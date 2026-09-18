import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { wedding, type WeddingConfig } from "../config/wedding.config";
import { mergeWeddingContent } from "../lib/merge-content";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type { SiteContentOverrides } from "../types/site-content";

type WeddingContentContextValue = {
  content: WeddingConfig;
  loading: boolean;
  cmsLoaded: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
};

const WeddingContentContext = createContext<WeddingContentContextValue>({
  content: wedding as WeddingConfig,
  loading: false,
  cmsLoaded: false,
  loadError: null,
  refresh: async () => undefined,
});

export function WeddingContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<SiteContentOverrides>({});
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [cmsLoaded, setCmsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadContent = async () => {
    setLoadError(null);
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setLoadError("Supabase belum dikonfigurasi.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (error) {
      setLoadError(error.message || "Gagal memuat konten undangan.");
      setLoading(false);
      return;
    }

    if (data?.content && typeof data.content === "object") {
      setOverrides(data.content as SiteContentOverrides);
      setCmsLoaded(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadContent();
  }, []);

  const content = useMemo(() => mergeWeddingContent(overrides), [overrides]);

  const value = useMemo(
    () => ({
      content,
      loading,
      cmsLoaded,
      loadError,
      refresh: loadContent,
    }),
    [content, loading, cmsLoaded, loadError],
  );

  return (
    <WeddingContentContext.Provider value={value}>{children}</WeddingContentContext.Provider>
  );
}

export function useWeddingContent() {
  return useContext(WeddingContentContext);
}
