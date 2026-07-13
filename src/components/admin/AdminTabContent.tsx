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

export function AdminTabContent({ tab, merged, updateDraft, setMessage }: AdminTabContentProps) {
  switch (tab) {
    case "umum":
      return <AdminUmumTab merged={merged} updateDraft={updateDraft} />;
    case "undangan":
      return <AdminUndanganTab merged={merged} updateDraft={updateDraft} setMessage={setMessage} />;
    case "mempelai":
      return <AdminMempelaiTab merged={merged} updateDraft={updateDraft} />;
    case "acara":
      return <AdminAcaraTab merged={merged} updateDraft={updateDraft} />;
    case "galeri":
      return <AdminGaleriTab merged={merged} updateDraft={updateDraft} />;
    case "gift":
      return <AdminGiftTab merged={merged} updateDraft={updateDraft} />;
    case "rsvp":
      return <AdminRsvpTab merged={merged} updateDraft={updateDraft} setMessage={setMessage} />;
    case "guestbook":
      return <AdminGuestbookTab merged={merged} updateDraft={updateDraft} />;
    case "penutup":
      return <AdminPenutupTab merged={merged} updateDraft={updateDraft} />;
    case "media":
      return <AdminMediaTab merged={merged} updateDraft={updateDraft} />;
  }
}
