import type { BulkGuestRow } from "../../../lib/guest-bulk";
import type { WeddingConfig } from "../../../config/wedding.config";
import { formatInviteLabel } from "./guest-invite-utils";

type InviteCopy = WeddingConfig["invite"];

type Props = {
  invite: InviteCopy;
  bulkOpen: boolean;
  setBulkOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  bulkText: string;
  setBulkText: (value: string) => void;
  bulkRows: BulkGuestRow[];
  bulkImporting: boolean;
  bulkReady: BulkGuestRow[];
  bulkErrorCount: number;
  onPreview: () => void;
  onCsvFile: (file: File | null) => void;
  onImport: () => void;
  onReset: () => void;
};

export function GuestBulkImport({
  invite,
  bulkOpen,
  setBulkOpen,
  bulkText,
  setBulkText,
  bulkRows,
  bulkImporting,
  bulkReady,
  bulkErrorCount,
  onPreview,
  onCsvFile,
  onImport,
  onReset,
}: Props) {
  return (
    <div className="admin-invite__bulk">
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-invite__bulk-toggle"
        onClick={() => setBulkOpen((open) => !open)}
        aria-expanded={bulkOpen}
      >
        {invite.bulkToggle}
      </button>

      {bulkOpen ? (
        <div className="admin-invite__bulk-panel">
          <p className="admin-invite__bulk-hint">{invite.bulkPasteHint}</p>
          <textarea
            className="admin-input admin-invite__bulk-textarea"
            rows={5}
            value={bulkText}
            placeholder={invite.bulkPastePlaceholder}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="admin-invite__bulk-actions">
            <label className="admin-btn admin-btn--ghost admin-invite__bulk-file">
              {invite.bulkCsvButton}
              <input
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => {
                  void onCsvFile(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={!bulkText.trim()}
              onClick={onPreview}
            >
              {invite.bulkPreviewButton}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={bulkImporting || bulkReady.length === 0}
              onClick={onImport}
            >
              {bulkImporting
                ? "..."
                : formatInviteLabel(invite.bulkImportButton, { n: bulkReady.length })}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onReset}>
              {invite.bulkCancelButton}
            </button>
          </div>
          <p className="admin-invite__bulk-hint">{invite.bulkCsvHint}</p>
          {bulkRows.length > 0 ? (
            <>
              <p className="admin-invite__bulk-summary">
                {formatInviteLabel(invite.bulkReadyLabel, {
                  ready: bulkReady.length,
                  error: bulkErrorCount,
                })}
              </p>
              <div className="admin-datalist-wrap admin-invite__bulk-preview">
                <table className="admin-datalist">
                  <thead>
                    <tr>
                      <th className="admin-datalist__col-no">No</th>
                      <th>{invite.nameLabel}</th>
                      <th>{invite.phoneLabel}</th>
                      <th>{invite.slugLabel}</th>
                      <th>{invite.bulkColStatus}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map((row, idx) => (
                      <tr
                        key={`${row.line}-${row.slug || idx}`}
                        className={idx % 2 === 1 ? "admin-datalist__row--stripe" : undefined}
                      >
                        <td className="admin-datalist__no">{row.line}</td>
                        <td className="admin-datalist__name">{row.display_name || "—"}</td>
                        <td className="admin-datalist__mono">{row.phone || "—"}</td>
                        <td className="admin-datalist__mono">{row.slug || "—"}</td>
                        <td>
                          <span
                            className={
                              row.ok
                                ? "admin-datalist__status admin-datalist__status--ok"
                                : "admin-datalist__status admin-datalist__status--warn"
                            }
                          >
                            {row.ok ? invite.bulkStatusOk : row.error}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
