import { createContext } from "react";
import { wedding, type WeddingConfig } from "../config/wedding.config";

export type WeddingContentContextValue = {
  content: WeddingConfig;
  loading: boolean;
  cmsLoaded: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
};

export const WeddingContentContext = createContext<WeddingContentContextValue>({
  content: wedding as WeddingConfig,
  loading: false,
  cmsLoaded: false,
  loadError: null,
  refresh: async () => undefined,
});
