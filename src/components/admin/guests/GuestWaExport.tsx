import { useEffect, useMemo, useState } from "react";
import type { WeddingConfig } from "../../../config/wedding.config";
import type { Guest } from "../../../lib/supabase";
import {
  buildWaExportEntries,
  downloadWaExportText,
  formatWaExportLinksOnly,
  formatWaExportPlainText,
  type WaExportEntry,
} from "../../../lib/wa-message-export";

type InviteCopy = WeddingConfig["invite"];

type Props = {
  open: boolean;
  onClose: () => void;
  invite: InviteCopy;
  guests: Guest[];
  buildMessage: (guest: Pick<Guest, "display_name" | "slug">, templateId: string) => string;
  getGuestTemplateId: (guestId: string) => string;
  onOpenWhatsApp: (guest: Guest, waUrl: string) => void;
  onNotify: (message: string) => void;
};

export function GuestWaExport({
  open,
  onClose,
  invite,
  guests,
  buildMessage,
  getGuestTemplateId,
  onOpenWhatsApp,
  onNotify,
}: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const entries = useMemo(
    () =>
      buildWaExportEntries(guests, (guest) => buildMessage(guest, getGuestTemplateId(guest.id))),
    [guests, buildMessage, getGuestTemplateId],
  );

  const withPhone = entries.filter((e) => e.hasPhone).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopiedId(null);
  }, [open]);

  if (!open) return null;

  const copyText = async (text: string, notify: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) setCopiedId(id);
      onNotify(notify);
    } catch {
      onNotify(invite.guestError);
    }
  };

  const handleCopyAll = () => {
    const text = formatWaExportPlainText(entries);
    if (!text) {
      onNotify(invite.waExportEmpty);
      return;
    }
    void copyText(text, invite.waExportAllCopied, "all");
  };

  const handleCopyLinksOnly = () => {
    const text = formatWaExportLinksOnly(entries);
    if (!text) {
      onNotify(invite.waExportEmpty);
      return;
    }
    void copyText(text, invite.waExportAllCopied, "links");
  };

  const handleDownload = () => {
    const text = formatWaExportPlainText(entries);
    if (!text) {
      onNotify(invite.waExportEmpty);
      return;
    }
    downloadWaExportText(text);
    onNotify(invite.waExportDownloaded);
  };

  const guestById = (id: string) => guests.find((g) => g.id === id);

  return (
    <div className="admin-wa-export" role="presentation">
      <button
        type="button"
        className="admin-wa-export__backdrop"
        aria-label={invite.waExportClose}
        onClick={onClose}
      />
      <div
        className="admin-wa-export__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-wa-export-title"
      >
        <header className="admin-wa-export__header">
          <div>
            <p className="admin-wa-export__eyebrow">WhatsApp</p>
            <h2 id="admin-wa-export-title" className="admin-wa-export__title">
              {invite.waExportTitle}
            </h2>
            <p className="admin-wa-export__subtitle">{invite.waExportSubtitle}</p>
          </div>
          <button type="button" className="admin-btn" onClick={onClose}>
            {invite.waExportClose}
          </button>
        </header>

        <div className="admin-wa-export__meta">
          <span className="admin-invite__stat">
            <strong>{entries.length}</strong> tamu
          </span>
          <span className="admin-invite__stat">
            <strong>{withPhone}</strong> siap WA
          </span>
        </div>

        <div className="admin-wa-export__toolbar">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={withPhone === 0}
            onClick={handleCopyAll}
          >
            {invite.waExportCopyAll}
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={withPhone === 0}
            onClick={handleCopyLinksOnly}
          >
            {invite.waExportCopyLinksOnly}
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={withPhone === 0}
            onClick={handleDownload}
          >
            {invite.waExportDownload}
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="admin-wa-export__empty">{invite.waExportEmpty}</p>
        ) : (
          <ol className="admin-wa-export__list">
            {entries.map((entry) => (
              <WaExportCard
                key={entry.id}
                entry={entry}
                invite={invite}
                copied={copiedId === entry.id}
                onCopyLink={() => {
                  if (!entry.chatUrl) {
                    onNotify(invite.noPhone);
                    return;
                  }
                  void copyText(entry.chatUrl, invite.waExportCopied, entry.id);
                }}
                onCopyMessage={() => {
                  void copyText(entry.message, invite.waExportCopied, `${entry.id}-msg`);
                }}
                onOpenWa={() => {
                  const guest = guestById(entry.id);
                  if (guest && entry.waUrl) onOpenWhatsApp(guest, entry.waUrl);
                  else onNotify(invite.noPhone);
                }}
              />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function WaExportCard({
  entry,
  invite,
  copied,
  onCopyLink,
  onCopyMessage,
  onOpenWa,
}: {
  entry: WaExportEntry;
  invite: InviteCopy;
  copied: boolean;
  onCopyLink: () => void;
  onCopyMessage: () => void;
  onOpenWa: () => void;
}) {
  return (
    <li className="admin-wa-export__card">
      <div className="admin-wa-export__card-head">
        <span className="admin-wa-export__num">{entry.index}</span>
        <div className="admin-wa-export__identity">
          <strong className="admin-wa-export__name">{entry.name}</strong>
          <span className="admin-wa-export__phone">
            {entry.hasPhone ? entry.phone : invite.waExportNoPhone}
          </span>
        </div>
      </div>
      {entry.chatUrl ? (
        <code className="admin-wa-export__link" title={entry.chatUrl}>
          {entry.chatUrl}
        </code>
      ) : (
        <p className="admin-wa-export__empty-link">{invite.waExportNoPhone}</p>
      )}
      <div className="admin-wa-export__card-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={!entry.waUrl}
          onClick={onOpenWa}
        >
          {invite.waExportOpenWa}
        </button>
        <button type="button" className="admin-btn" disabled={!entry.chatUrl} onClick={onCopyLink}>
          {copied ? "✓ Tersalin" : invite.waExportCopyLink}
        </button>
        <button type="button" className="admin-btn" onClick={onCopyMessage}>
          {invite.waExportCopyMessage}
        </button>
      </div>
    </li>
  );
}
