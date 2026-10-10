import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { wedding, type WeddingConfig } from "../config/wedding.config";
import { mergeWeddingContent } from "../lib/merge-content";
import { fetchSiteContentMain, isSupabaseConfigured } from "../lib/supabase-rest";
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

  return (
    <WeddingContentContext.Provider value={value}>{children}</WeddingContentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useWeddingContent() {
  return useContext(WeddingContentContext);
}
