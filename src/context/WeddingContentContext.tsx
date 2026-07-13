import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { wedding, type WeddingConfig } from "../config/wedding.config";
import { mergeWeddingContent } from "../lib/merge-content";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type { SiteContentOverrides } from "../types/site-content";

type WeddingContentContextValue = {
  content: WeddingConfig;
  loading: boolean;
  cmsLoaded: boolean;
  refresh: () => Promise<void>;
};

const WeddingContentContext = createContext<WeddingContentContextValue>({
  content: wedding as WeddingConfig,
  loading: false,
  cmsLoaded: false,
  refresh: async () => undefined,
});

export function WeddingContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<SiteContentOverrides>({});
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  const loadContent = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (!error && data?.content && typeof data.content === "object") {
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
      refresh: loadContent,
    }),
    [content, loading, cmsLoaded],
  );

  return (
    <WeddingContentContext.Provider value={value}>{children}</WeddingContentContext.Provider>
  );
}

export function useWeddingContent() {
  return useContext(WeddingContentContext);
}
