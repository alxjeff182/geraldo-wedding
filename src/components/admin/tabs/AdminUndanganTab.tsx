import { GuestInvitePanel } from "../GuestInvitePanel";
import type { AdminTabProps } from "../types";

type AdminUndanganTabProps = AdminTabProps & {
  setMessage: (text: string | null, options?: { retry?: () => void }) => void;
};

export function AdminUndanganTab({ merged, updateDraft, setMessage }: AdminUndanganTabProps) {
  return (
    <GuestInvitePanel
      invite={merged.invite}
      siteUrl={merged.site.url}
      coupleTitle={merged.site.title}
      dateLabel={merged.dateLabel}
      location={merged.location}
      onTemplatesChange={(value) => updateDraft(["invite", "whatsappTemplates"], value)}
      onDefaultTemplateChange={(value) => updateDraft(["invite", "defaultTemplateId"], value)}
      onSalutationChange={(value) => updateDraft(["invite", "salutation"], value)}
      onNotify={(text, options) => setMessage(text, options)}
    />
  );
}
