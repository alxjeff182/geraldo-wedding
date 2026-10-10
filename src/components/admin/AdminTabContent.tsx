import type { AdminTabContentProps } from "./types";
import { AdminUmumTab } from "./tabs/AdminUmumTab";
import { AdminUndanganTab } from "./tabs/AdminUndanganTab";
import { AdminMempelaiTab } from "./tabs/AdminMempelaiTab";
import { AdminAcaraTab } from "./tabs/AdminAcaraTab";
import { AdminGaleriTab } from "./tabs/AdminGaleriTab";
import { AdminGiftTab } from "./tabs/AdminGiftTab";
import { AdminRsvpTab } from "./tabs/AdminRsvpTab";
import { AdminGuestbookTab } from "./tabs/AdminGuestbookTab";
import { AdminPenutupTab } from "./tabs/AdminPenutupTab";
import { AdminMediaTab } from "./tabs/AdminMediaTab";

export function AdminTabContent({
  tab,
  merged,
  defaults,
  updateDraft,
  clearDraftPath,
  setMessage,
}: AdminTabContentProps) {
  const tabProps = { merged, defaults, updateDraft, clearDraftPath };
  switch (tab) {
    case "umum":
      return <AdminUmumTab {...tabProps} />;
    case "undangan":
      return <AdminUndanganTab {...tabProps} setMessage={setMessage} />;
    case "mempelai":
      return <AdminMempelaiTab {...tabProps} />;
    case "acara":
      return <AdminAcaraTab {...tabProps} />;
    case "galeri":
      return <AdminGaleriTab {...tabProps} />;
    case "gift":
      return <AdminGiftTab {...tabProps} />;
    case "rsvp":
      return <AdminRsvpTab {...tabProps} setMessage={setMessage} />;
    case "guestbook":
      return <AdminGuestbookTab {...tabProps} setMessage={setMessage} />;
    case "penutup":
      return <AdminPenutupTab {...tabProps} />;
    case "media":
      return <AdminMediaTab {...tabProps} />;
  }
}
