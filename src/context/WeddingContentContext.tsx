import { useEffect, useMemo, useState, type ReactNode } from "react";
import { mergeWeddingContent } from "../lib/merge-content";
import { fetchSiteContentMain, isSupabaseConfigured } from "../lib/supabase-rest";
import type { SiteContentOverrides } from "../types/site-content";
import { WeddingContentContext } from "./wedding-content-context";

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

    setLoading(true);
    const { content: cmsContent, error } = await fetchSiteContentMain();

    if (error) {
      setLoadError(error);
      setLoading(false);
      return;
    }

    if (cmsContent) {
      setOverrides(cmsContent);
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

  return <WeddingContentContext.Provider value={value}>{children}</WeddingContentContext.Provider>;
}
