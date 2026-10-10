import type { Guest } from "../../../lib/supabase";
import type { WeddingConfig } from "../../../config/wedding.config";

type InviteCopy = WeddingConfig["invite"];

type CompactProps = {
  invite: InviteCopy;
  guest: Guest;
  waUrl: string | null;
  savingId: string | null;
  onWhatsApp: () => void;
  onDelete: () => void;
  onPreview: () => void;
};

export function GuestRowCompactActions({
  invite,
  guest,
  waUrl,
  savingId,
  onWhatsApp,
  onDelete,
  onPreview,
}: CompactProps) {
  return (
    <div className="admin-datalist__row-actions">
      <button
        type="button"
        className="admin-datalist__action"
        title="Pratinjau sebagai tamu"
        aria-label={`Pratinjau undangan untuk ${guest.display_name}`}
        onClick={onPreview}
      >
        👁
      </button>
      {waUrl ? (
        <button
          type="button"
          className="admin-datalist__action"
          title={invite.openWhatsApp}
          aria-label={invite.openWhatsApp}
          onClick={onWhatsApp}
        >
          ✈
        </button>
      ) : (
        <button
          type="button"
          className="admin-datalist__action admin-datalist__action--disabled"
          disabled
          title={invite.noPhone}
        >
          ✈
        </button>
      )}
      <button
        type="button"
        className="admin-datalist__action admin-datalist__action--danger"
        disabled={savingId === guest.id}
        title="Hapus"
        aria-label={`Hapus ${guest.display_name}`}
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  );
}

type DetailProps = {
  invite: InviteCopy;
  inviteUrl: string;
  waSent: boolean;
  savingId: string | null;
  onCopyLink: () => void;
  onToggleSent: () => void;
  onSave: () => void;
  onDelete: () => void;
  onPreview: () => void;
};

export function GuestRowDetailActions({
  invite,
  inviteUrl,
  waSent,
  savingId,
  onCopyLink,
  onToggleSent,
  onSave,
  onDelete,
  onPreview,
}: DetailProps) {
  return (
    <div className="admin-datalist__detail-actions">
      <span className="admin-datalist__link" title={inviteUrl}>
        {inviteUrl}
      </span>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        onClick={onPreview}
      >
        Pratinjau tamu
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        onClick={onCopyLink}
      >
        {invite.copyLink}
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        disabled={savingId !== null}
        onClick={onToggleSent}
      >
        {waSent ? invite.markWaUnsent : invite.markWaSent}
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        disabled={savingId !== null}
        onClick={onSave}
      >
        Simpan
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--danger admin-btn--sm"
        disabled={savingId !== null}
        onClick={onDelete}
      >
        Hapus
      </button>
    </div>
  );
}
