import { Fragment } from "react";
import type { InviteMessageTemplate } from "../../../config/invite-templates";
import { getInviteTemplateById } from "../../../config/invite-templates";
import { buildGuestInviteUrl, buildWhatsAppUrl } from "../../../lib/invite-links";
import type { Guest } from "../../../lib/supabase";
import { GuestBulkImport } from "./GuestBulkImport";
import { GuestRowCompactActions, GuestRowDetailActions } from "./GuestRowActions";
import { formatGuestDate, PAGE_SIZES, truncate } from "./guest-invite-utils";
import type { GuestsController } from "./useGuests";

type Props = {
  guests: GuestsController;
};

export function GuestTable({ guests: g }: Props) {
  const { invite, templates } = g;

  return (
    <div className="admin-invite__main">
      <div className="admin-datalist__bar">
        <input
          className="admin-input admin-invite__search"
          type="search"
          value={g.search}
          placeholder={invite.searchPlaceholder}
          onChange={(e) => g.setSearch(e.target.value)}
        />

        <select
          className="admin-input"
          value={g.sentFilter}
          aria-label="Filter status WA"
          onChange={(e) => {
            g.setSentFilter(e.target.value as typeof g.sentFilter);
            g.setPage(1);
          }}
        >
          <option value="all">Semua</option>
          <option value="unsent">Belum terkirim</option>
          <option value="sent">Terkirim</option>
        </select>

        <button type="button" className="admin-btn" onClick={g.sendNextUnsent}>
          Kirim berikutnya
        </button>

        <div className="admin-invite__stats" aria-label="Ringkasan tamu">
          <span className="admin-invite__stat">
            <strong>{g.stats.total}</strong> tamu
          </span>
          <span className="admin-invite__stat">
            <strong>{g.stats.withPhone}</strong> WA
          </span>
        </div>

        <div className="admin-datalist__pager" aria-label="Pagination">
          <button
            type="button"
            className="admin-datalist__page-btn"
            disabled={g.currentPage <= 1}
            onClick={() => g.setPage(1)}
            aria-label="Halaman pertama"
          >
            «
          </button>
          <button
            type="button"
            className="admin-datalist__page-btn"
            disabled={g.currentPage <= 1}
            onClick={() => g.setPage((p) => Math.max(1, p - 1))}
            aria-label="Sebelumnya"
          >
            ‹
          </button>
          {g.pageNumbers.map((num) => (
            <button
              key={num}
              type="button"
              className={`admin-datalist__page-btn${num === g.currentPage ? " admin-datalist__page-btn--active" : ""}`}
              onClick={() => g.setPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="admin-datalist__page-btn"
            disabled={g.currentPage >= g.totalPages}
            onClick={() => g.setPage((p) => Math.min(g.totalPages, p + 1))}
            aria-label="Berikutnya"
          >
            ›
          </button>
          <button
            type="button"
            className="admin-datalist__page-btn"
            disabled={g.currentPage >= g.totalPages}
            onClick={() => g.setPage(g.totalPages)}
            aria-label="Halaman terakhir"
          >
            »
          </button>
          <select
            className="admin-input admin-datalist__page-size"
            value={g.pageSize}
            onChange={(e) => g.setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
            aria-label="Baris per halaman"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-invite__add-row">
        <input
          className="admin-input"
          value={g.newGuest.display_name}
          placeholder={invite.nameLabel}
          onChange={(e) => g.setNewGuest((prev) => ({ ...prev, display_name: e.target.value }))}
        />
        <input
          className="admin-input"
          value={g.newGuest.phone}
          placeholder={invite.phoneLabel}
          inputMode="tel"
          onChange={(e) => g.setNewGuest((prev) => ({ ...prev, phone: e.target.value }))}
        />
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={g.adding}
          onClick={() => void g.handleAddGuest()}
        >
          {g.adding ? "..." : invite.addGuestButton}
        </button>
      </div>

      <GuestBulkImport
        invite={invite}
        bulkOpen={g.bulkOpen}
        setBulkOpen={g.setBulkOpen}
        bulkText={g.bulkText}
        setBulkText={g.setBulkText}
        bulkRows={g.bulkRows}
        bulkImporting={g.bulkImporting}
        bulkReady={g.bulkReady}
        bulkErrorCount={g.bulkErrorCount}
        onPreview={g.handleBulkPreview}
        onCsvFile={(file) => void g.handleBulkCsvFile(file)}
        onImport={() => void g.handleBulkImport()}
        onReset={g.resetBulk}
      />

      {g.loading ? (
        <p className="admin-invite__empty">Memuat daftar tamu...</p>
      ) : g.filteredGuests.length === 0 ? (
        <p className="admin-invite__empty">{invite.emptyGuests}</p>
      ) : (
        <div className="admin-datalist-wrap">
          <table className="admin-datalist">
            <thead>
              <tr>
                <th className="admin-datalist__col-expand" aria-label="Expand" />
                <th className="admin-datalist__col-no">No</th>
                <th>
                  <button
                    type="button"
                    className="admin-datalist__sort"
                    onClick={() => g.toggleSort("name")}
                  >
                    {invite.nameLabel} <span>{g.sortIcon("name")}</span>
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="admin-datalist__sort"
                    onClick={() => g.toggleSort("phone")}
                  >
                    {invite.phoneLabel} <span>{g.sortIcon("phone")}</span>
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="admin-datalist__sort"
                    onClick={() => g.toggleSort("template")}
                  >
                    Template <span>{g.sortIcon("template")}</span>
                  </button>
                </th>
                <th className="admin-datalist__col-msg">Isi Pesan</th>
                <th>
                  <button
                    type="button"
                    className="admin-datalist__sort"
                    onClick={() => g.toggleSort("created")}
                  >
                    Ditambah <span>{g.sortIcon("created")}</span>
                  </button>
                </th>
                <th>Status</th>
                <th className="admin-datalist__col-action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {g.pagedGuests.map((guest, index) => (
                <GuestTableRow
                  key={guest.id}
                  guest={guest}
                  index={index}
                  guests={g}
                  templates={templates}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GuestTableRow({
  guest,
  index,
  guests: g,
  templates,
}: {
  guest: Guest;
  index: number;
  guests: GuestsController;
  templates: InviteMessageTemplate[];
}) {
  const { invite } = g;
  const templateId = g.getGuestTemplateId(guest.id);
  const template = getInviteTemplateById(templates, templateId);
  const preview = g.buildMessage(guest, templateId);
  const waUrl = guest.phone ? buildWhatsAppUrl(guest.phone, preview) : null;
  const inviteUrl = buildGuestInviteUrl(g.siteUrl, guest.slug);
  const isExpanded = g.expandedId === guest.id;
  const rowNo = (g.currentPage - 1) * g.pageSize + index + 1;
  const hasPhone = Boolean(guest.phone?.trim());
  const waSent = Boolean(guest.invite_sent_at);

  return (
    <Fragment>
      <tr
        className={
          [
            index % 2 === 1 ? "admin-datalist__row--stripe" : "",
            isExpanded ? "admin-datalist__row--open" : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <td>
          <button
            type="button"
            className="admin-datalist__expand"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Tutup detail" : "Buka detail"}
            onClick={() => g.toggleExpand(guest.id)}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        </td>
        <td className="admin-datalist__no">{rowNo}</td>
        <td className="admin-datalist__name">{guest.display_name}</td>
        <td className="admin-datalist__mono">{guest.phone || "—"}</td>
        <td>{template.name}</td>
        <td className="admin-datalist__msg">{truncate(preview)}</td>
        <td className="admin-datalist__date">{formatGuestDate(guest.created_at)}</td>
        <td>
          <span
            className={`admin-datalist__status${waSent ? " admin-datalist__status--ok" : " admin-datalist__status--warn"}`}
            title={
              waSent
                ? formatGuestDate(guest.invite_sent_at ?? undefined)
                : hasPhone
                  ? invite.waUnsentLabel
                  : invite.noPhone
            }
          >
            {waSent ? invite.waSentLabel : invite.waUnsentLabel}
          </span>
        </td>
        <td className="admin-datalist__actions-cell">
          <GuestRowCompactActions
            invite={invite}
            guest={guest}
            waUrl={waUrl}
            savingId={g.savingId}
            onWhatsApp={() => waUrl && g.openWhatsAppAndMark(guest, waUrl)}
            onDelete={() => void g.handleDeleteGuest(guest)}
            onPreview={() => g.previewAsGuest(guest)}
          />
        </td>
      </tr>

      {isExpanded ? (
        <tr className="admin-datalist__detail-row">
          <td colSpan={9}>
            <div className="admin-datalist__detail">
              <div className="admin-datalist__detail-msg">
                <span className="admin-datalist__detail-label">Isi Pesan</span>
                <pre>{preview}</pre>
              </div>

              <div className="admin-datalist__detail-form">
                <label className="admin-field">
                  <span className="admin-label">{invite.nameLabel}</span>
                  <input
                    className="admin-input"
                    value={guest.display_name}
                    onChange={(e) => g.updateGuestField(guest.id, "display_name", e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-label">{invite.phoneLabel}</span>
                  <input
                    className="admin-input"
                    value={guest.phone ?? ""}
                    placeholder="081234567890"
                    inputMode="tel"
                    onChange={(e) => g.updateGuestField(guest.id, "phone", e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-label">{invite.templateSelectLabel}</span>
                  <select
                    className="admin-input"
                    value={templateId}
                    onChange={(e) => g.setGuestTemplate(guest.id, e.target.value)}
                  >
                    {templates.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <GuestRowDetailActions
                invite={invite}
                inviteUrl={inviteUrl}
                waSent={waSent}
                savingId={g.savingId}
                onCopyLink={() => void g.copyLink(guest)}
                onToggleSent={() => void g.handleMarkInviteSent(guest, !waSent)}
                onSave={() => void g.handleUpdateGuest(guest)}
                onDelete={() => void g.handleDeleteGuest(guest)}
                onPreview={() => g.previewAsGuest(guest)}
              />
            </div>
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}
