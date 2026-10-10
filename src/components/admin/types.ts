import type { WeddingConfig } from "../../config/wedding.config";

export type AdminTab =
  | "umum"
  | "undangan"
  | "mempelai"
  | "acara"
  | "galeri"
  | "gift"
  | "rsvp"
  | "guestbook"
  | "penutup"
  | "media";

export type UpdateDraft = (path: string[], value: unknown) => void;

export type ClearDraftPath = (path: string[]) => void;

export type AdminTabProps = {
  merged: WeddingConfig;
  defaults: WeddingConfig;
  updateDraft: UpdateDraft;
  clearDraftPath: ClearDraftPath;
};

export type AdminTabContentProps = AdminTabProps & {
  tab: AdminTab;
  setMessage: (text: string | null, options?: { retry?: () => void }) => void;
};
