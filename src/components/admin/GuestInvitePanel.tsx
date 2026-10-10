import type { InviteMessageTemplate } from "../../config/invite-templates";
import type { WeddingConfig } from "../../config/wedding.config";
import { GuestTable } from "./guests/GuestTable";
import { InviteTemplateEditor } from "./guests/InviteTemplateEditor";
import { useGuests } from "./guests/useGuests";

type InviteCopy = WeddingConfig["invite"];

type Props = {
  invite: InviteCopy;
  siteUrl: string;
  coupleTitle: string;
  dateLabel: string;
  location: string;
  acaraSummary?: string;
  venueSummary?: string;
  onTemplatesChange: (templates: InviteMessageTemplate[]) => void;
  onDefaultTemplateChange: (templateId: string) => void;
  onSalutationChange: (value: string) => void;
  onNotify: (message: string, options?: { retry?: () => void }) => void;
};

export function GuestInvitePanel({
  invite,
  siteUrl,
  coupleTitle,
  dateLabel,
  location,
  acaraSummary = "",
  venueSummary = "",
  onTemplatesChange,
  onDefaultTemplateChange,
  onSalutationChange,
  onNotify,
}: Props) {
  const guests = useGuests({
    invite,
    siteUrl,
    coupleTitle,
    dateLabel,
    location,
    acaraSummary,
    venueSummary,
    onNotify,
  });

  return (
    <div className="admin-invite">
      <div className="admin-invite-layout">
        <InviteTemplateEditor
          invite={invite}
          templates={guests.templates}
          onTemplatesChange={onTemplatesChange}
          onDefaultTemplateChange={onDefaultTemplateChange}
          onSalutationChange={onSalutationChange}
        />
        <GuestTable guests={guests} />
      </div>
    </div>
  );
}
