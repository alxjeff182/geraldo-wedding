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

export type AdminTabProps = {
  merged: WeddingConfig;
  updateDraft: UpdateDraft;
};

export type AdminTabContentProps = AdminTabProps & {
  tab: AdminTab;
  setMessage: (text: string | null) => void;
};
