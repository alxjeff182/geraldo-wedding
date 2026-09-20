import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import type { InviteMessageTemplate } from "../../config/invite-templates";
import { getInviteTemplateById } from "../../config/invite-templates";
import type { WeddingConfig } from "../../config/wedding.config";
import {
  allocateUniqueSlug,
  bulkRowsReady,
  parseGuestBulkCsv,
  parseGuestBulkText,
  phoneUniquenessKey,
  type BulkGuestRow,
} from "../../lib/guest-bulk";
import {
  INVITE_TEMPLATE_VARIABLES,
  buildGuestInviteUrl,
  buildWhatsAppUrl,
  formatInviteMessage,
  slugifyGuestName,
} from "../../lib/invite-links";
import { getSupabase } from "../../lib/supabase";
import type { Guest } from "../../lib/supabase";

const BULK_INSERT_CHUNK = 50;

function formatInviteLabel(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

type InviteCopy = WeddingConfig["invite"];

type Props = {
  invite: InviteCopy;
  siteUrl: string;
  coupleTitle: string;
  dateLabel: string;
  location: string;
  onTemplatesChange: (templates: InviteMessageTemplate[]) => void;
  onDefaultTemplateChange: (templateId: string) => void;
  onSalutationChange: (value: string) => void;
  onNotify: (message: string, options?: { retry?: () => void }) => void;
};

type GuestDraft = {
  display_name: string;
  phone: string;
};

type SortKey = "name" | "phone" | "template" | "created";
type SortDir = "asc" | "desc";

const PAGE_SIZES = [10, 15, 25, 50] as const;

const emptyDraft = (): GuestDraft => ({
  display_name: "",
  phone: "",
});

function truncate(text: string, max = 72): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GuestInvitePanel({
  invite,
  siteUrl,
  coupleTitle,
  dateLabel,
  location,
  onTemplatesChange,
  onDefaultTemplateChange,
  onSalutationChange,
  onNotify,
}: Props) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newGuest, setNewGuest] = useState<GuestDraft>(emptyDraft);
  const [search, setSearch] = useState("");
  const [templateByGuest, setTemplateByGuest] = useState<Record<string, string>>({});
  const [editingTemplateId, setEditingTemplateId] = useState(invite.defaultTemplateId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(15);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkRows, setBulkRows] = useState<BulkGuestRow[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);

  const templates = invite.whatsappTemplates;
  const editingTemplate = getInviteTemplateById(templates, editingTemplateId);
  const existingSlugs = useMemo(() => guests.map((g) => g.slug), [guests]);
  const existingPhones = useMemo(() => {
    const keys: string[] = [];
    for (const g of guests) {
      const key = phoneUniquenessKey(g.phone);
      if (key) keys.push(key);
    }
    return keys;
  }, [guests]);
  const bulkReady = useMemo(() => bulkRowsReady(bulkRows), [bulkRows]);
  const bulkErrorCount = bulkRows.length - bulkReady.length;

  const loadGuests = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("guests")
      .select("id, slug, display_name, phone, invite_sent_at, created_at")
      .order("display_name", { ascending: true });

    if (error) {
      onNotify(error.message || invite.guestError, { retry: () => void loadGuests() });
      setLoading(false);
      return;
    }

    setGuests(data ?? []);
    setLoading(false);
  }, [invite.guestError, onNotify]);

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  useEffect(() => {
    if (!loading) return;
    const stuckTimer = window.setTimeout(() => {
      setLoading(false);
      onNotify("Memuat daftar tamu terlalu lama. Periksa koneksi, lalu coba lagi.", {
        retry: () => {
          setLoading(true);
          void loadGuests();
        },
      });
    }, 15000);
    return () => window.clearTimeout(stuckTimer);
  }, [loading, loadGuests, onNotify]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const getGuestTemplateId = (guestId: string) =>
    templateByGuest[guestId] ?? invite.defaultTemplateId;

  const buildMessage = (
    guest: Pick<Guest, "display_name" | "slug">,
    templateId: string,
  ) => {
    const template = getInviteTemplateById(templates, templateId);
    const link = buildGuestInviteUrl(siteUrl, guest.slug);
    return formatInviteMessage(template.message, {
      nama: guest.display_name,
      link,
      tanggal: dateLabel,
      lokasi: location,
      pasangan: coupleTitle,
      salam: invite.salutation,
      slug: guest.slug,
    });
  };

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = !q
      ? guests
      : guests.filter(
          (guest) =>
            guest.display_name.toLowerCase().includes(q) ||
            guest.slug.toLowerCase().includes(q) ||
            (guest.phone ?? "").toLowerCase().includes(q),
        );

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.display_name.localeCompare(b.display_name, "id");
      } else if (sortKey === "phone") {
        cmp = (a.phone ?? "").localeCompare(b.phone ?? "", "id");
      } else if (sortKey === "template") {
        const ta = getInviteTemplateById(templates, getGuestTemplateId(a.id)).name;
        const tb = getInviteTemplateById(templates, getGuestTemplateId(b.id)).name;
        cmp = ta.localeCompare(tb, "id");
      } else {
        cmp =
          new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [guests, search, sortKey, sortDir, templates, templateByGuest, invite.defaultTemplateId]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedGuests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGuests.slice(start, start + pageSize);
  }, [filteredGuests, currentPage, pageSize]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const stats = useMemo(
    () => ({
      total: guests.length,
      withPhone: guests.filter((g) => g.phone?.trim()).length,
    }),
    [guests],
  );

  const updateTemplate = (templateId: string, patch: Partial<InviteMessageTemplate>) => {
    onTemplatesChange(
      templates.map((item) => (item.id === templateId ? { ...item, ...patch } : item)),
    );
  };

  const appendVariableToTemplate = (templateId: string, variable: string) => {
    const template = getInviteTemplateById(templates, templateId);
    updateTemplate(templateId, { message: `${template.message}{${variable}}` });
  };

  const handleAddGuest = async () => {
    const display_name = newGuest.display_name.trim();
    const phone = newGuest.phone.trim();
    const phoneKey = phoneUniquenessKey(phone);

    if (!display_name) return;

    if (phone && !phoneKey) {
      onNotify("Nomor WA tidak valid");
      return;
    }

    if (phoneKey && existingPhones.includes(phoneKey)) {
      onNotify("Nomor WA sudah ada di daftar");
      return;
    }

    const slug = allocateUniqueSlug(slugifyGuestName(display_name), new Set(existingSlugs));

    setAdding(true);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify(invite.guestError);
      setAdding(false);
      return;
    }

    const { error } = await supabase.from("guests").insert({
      display_name,
      slug,
      phone: phone || null,
    });

    setAdding(false);

    if (error) {
      onNotify(invite.guestError);
      return;
    }

    setNewGuest(emptyDraft());
    onNotify(invite.guestAdded);
    await loadGuests();
  };

  const resetBulk = () => {
    setBulkText("");
    setBulkRows([]);
    setBulkOpen(false);
  };

  const runBulkPreview = (raw: string, source: "paste" | "csv") => {
    const rows =
      source === "csv"
        ? parseGuestBulkCsv(raw, { existingSlugs, existingPhones })
        : parseGuestBulkText(raw, { existingSlugs, existingPhones });
    setBulkRows(rows);
    if (rows.length === 0) {
      onNotify(invite.bulkEmptyPreview);
    }
  };

  const handleBulkPreview = () => {
    runBulkPreview(bulkText, "paste");
  };

  const handleBulkCsvFile = async (file: File | null) => {
    if (!file) return;
    const raw = await file.text();
    setBulkText(raw);
    runBulkPreview(raw, "csv");
  };

  const handleBulkImport = async () => {
    const ready = bulkRowsReady(bulkRows);
    if (ready.length === 0) return;

    setBulkImporting(true);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify(invite.bulkImportError);
      setBulkImporting(false);
      return;
    }

    const payload = ready.map((row) => ({
      display_name: row.display_name,
      slug: row.slug,
      phone: row.phone,
    }));

    for (let i = 0; i < payload.length; i += BULK_INSERT_CHUNK) {
      const chunk = payload.slice(i, i + BULK_INSERT_CHUNK);
      const { error } = await supabase.from("guests").insert(chunk);
      if (error) {
        setBulkImporting(false);
        onNotify(invite.bulkImportError);
        await loadGuests();
        return;
      }
    }

    setBulkImporting(false);
    setBulkText("");
    setBulkRows([]);
    setBulkOpen(false);
    onNotify(formatInviteLabel(invite.bulkImported, { n: ready.length }));
    await loadGuests();
  };

  const handleUpdateGuest = async (guest: Guest) => {
    setSavingId(guest.id);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify(invite.guestError);
      setSavingId(null);
      return;
    }

    const display_name = guest.display_name.trim();
    const phone = guest.phone?.trim() || "";
    const phoneKey = phoneUniquenessKey(phone);

    if (phone && !phoneKey) {
      onNotify("Nomor WA tidak valid");
      setSavingId(null);
      return;
    }

    if (
      phoneKey &&
      guests.some((g) => g.id !== guest.id && phoneUniquenessKey(g.phone) === phoneKey)
    ) {
      onNotify("Nomor WA sudah ada di daftar");
      setSavingId(null);
      return;
    }

    const takenSlugs = new Set(
      guests.filter((g) => g.id !== guest.id).map((g) => g.slug.toLowerCase()),
    );
    const slug = allocateUniqueSlug(slugifyGuestName(display_name), takenSlugs);

    const { error } = await supabase
      .from("guests")
      .update({
        display_name,
        slug,
        phone: phone || null,
      })
      .eq("id", guest.id);

    setSavingId(null);

    if (error) {
      onNotify(invite.guestError);
      return;
    }

    onNotify(invite.guestUpdated);
    await loadGuests();
  };

  const handleDeleteGuest = async (guest: Guest) => {
    if (!window.confirm(invite.deleteConfirm)) return;

    setSavingId(guest.id);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify(invite.guestError);
      setSavingId(null);
      return;
    }

    const { error } = await supabase.from("guests").delete().eq("id", guest.id);
    setSavingId(null);

    if (error) {
      onNotify(invite.guestError);
      return;
    }

    setTemplateByGuest((prev) => {
      const next = { ...prev };
      delete next[guest.id];
      return next;
    });
    if (expandedId === guest.id) setExpandedId(null);
    onNotify(invite.guestDeleted);
    await loadGuests();
  };

  const handleMarkInviteSent = async (guest: Guest, sent: boolean) => {
    setSavingId(guest.id);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify(invite.guestError);
      setSavingId(null);
      return;
    }

    const invite_sent_at = sent ? new Date().toISOString() : null;
    const { error } = await supabase.from("guests").update({ invite_sent_at }).eq("id", guest.id);
    setSavingId(null);

    if (error) {
      onNotify(invite.guestError);
      return;
    }

    setGuests((prev) =>
      prev.map((item) => (item.id === guest.id ? { ...item, invite_sent_at } : item)),
    );
    onNotify(sent ? invite.waMarkedSent : invite.waMarkedUnsent);
  };

  const openWhatsAppAndMark = (guest: Guest, waUrl: string) => {
    window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!guest.invite_sent_at) {
      void handleMarkInviteSent(guest, true);
    }
  };

  const copyLink = async (guest: Guest) => {
    try {
      await navigator.clipboard.writeText(buildGuestInviteUrl(siteUrl, guest.slug));
      onNotify(invite.copyLinkSuccess);
    } catch {
      onNotify(invite.guestError);
    }
  };

  const updateGuestField = (id: string, field: keyof Guest, value: string) => {
    setGuests((prev) =>
      prev.map((guest) => (guest.id === id ? { ...guest, [field]: value } : guest)),
    );
  };

  const setGuestTemplate = (guestId: string, templateId: string) => {
    setTemplateByGuest((prev) => ({ ...prev, [guestId]: templateId }));
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="admin-invite">
      <div className="admin-invite-layout">
        <aside className="admin-invite__side">
          <fieldset className="admin-fieldset admin-fieldset--compact admin-invite__template">
            <legend>{invite.templateLabel}</legend>

            <div className="admin-invite__template-meta">
              <label className="admin-field">
                <span className="admin-label">{invite.defaultTemplateLabel}</span>
                <select
                  className="admin-input"
                  value={invite.defaultTemplateId}
                  onChange={(e) => onDefaultTemplateChange(e.target.value)}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-label">Salam ({`{salam}`})</span>
                <input
                  className="admin-input"
                  value={invite.salutation}
                  onChange={(e) => onSalutationChange(e.target.value)}
                />
              </label>
            </div>

            <div className="admin-invite__tabs" role="tablist" aria-label="Template pesan">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  role="tab"
                  aria-selected={editingTemplateId === template.id}
                  className={`admin-invite__tab${editingTemplateId === template.id ? " admin-invite__tab--active" : ""}`}
                  onClick={() => setEditingTemplateId(template.id)}
                >
                  {template.name}
                </button>
              ))}
            </div>

            <label className="admin-field admin-field--wide">
              <span className="admin-label">{invite.templateNameLabel}</span>
              <input
                className="admin-input"
                value={editingTemplate.name}
                onChange={(e) => updateTemplate(editingTemplateId, { name: e.target.value })}
              />
            </label>

            <div className="admin-invite__vars">
              {INVITE_TEMPLATE_VARIABLES.map((item) => (
                <button
                  key={`${editingTemplateId}-${item.key}`}
                  type="button"
                  className="admin-invite__var"
                  onClick={() => appendVariableToTemplate(editingTemplateId, item.key)}
                >
                  {`{${item.key}}`}
                </button>
              ))}
            </div>

            <label className="admin-field admin-field--wide">
              <span className="admin-label">{invite.templateMessageLabel}</span>
              <textarea
                className="admin-input admin-invite__message"
                rows={14}
                value={editingTemplate.message}
                onChange={(e) => updateTemplate(editingTemplateId, { message: e.target.value })}
              />
            </label>
          </fieldset>
        </aside>

        <div className="admin-invite__main">
          <div className="admin-datalist__bar">
            <input
              className="admin-input admin-invite__search"
              type="search"
              value={search}
              placeholder={invite.searchPlaceholder}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="admin-invite__stats" aria-label="Ringkasan tamu">
              <span className="admin-invite__stat">
                <strong>{stats.total}</strong> tamu
              </span>
              <span className="admin-invite__stat">
                <strong>{stats.withPhone}</strong> WA
              </span>
            </div>

            <div className="admin-datalist__pager" aria-label="Pagination">
              <button
                type="button"
                className="admin-datalist__page-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage(1)}
                aria-label="Halaman pertama"
              >
                «
              </button>
              <button
                type="button"
                className="admin-datalist__page-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Sebelumnya"
              >
                ‹
              </button>
              {pageNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`admin-datalist__page-btn${num === currentPage ? " admin-datalist__page-btn--active" : ""}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="admin-datalist__page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Berikutnya"
              >
                ›
              </button>
              <button
                type="button"
                className="admin-datalist__page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(totalPages)}
                aria-label="Halaman terakhir"
              >
                »
              </button>
              <select
                className="admin-input admin-datalist__page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
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
              value={newGuest.display_name}
              placeholder={invite.nameLabel}
              onChange={(e) => setNewGuest((prev) => ({ ...prev, display_name: e.target.value }))}
            />
            <input
              className="admin-input"
              value={newGuest.phone}
              placeholder={invite.phoneLabel}
              inputMode="tel"
              onChange={(e) => setNewGuest((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={adding || !newGuest.display_name.trim()}
              onClick={() => void handleAddGuest()}
            >
              {adding ? "..." : invite.addGuestButton}
            </button>
          </div>

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
                        void handleBulkCsvFile(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={!bulkText.trim()}
                    onClick={handleBulkPreview}
                  >
                    {invite.bulkPreviewButton}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    disabled={bulkImporting || bulkReady.length === 0}
                    onClick={() => void handleBulkImport()}
                  >
                    {bulkImporting
                      ? "..."
                      : formatInviteLabel(invite.bulkImportButton, { n: bulkReady.length })}
                  </button>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={resetBulk}>
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

          {loading ? (
            <p className="admin-invite__empty">Memuat daftar tamu...</p>
          ) : filteredGuests.length === 0 ? (
            <p className="admin-invite__empty">{invite.emptyGuests}</p>
          ) : (
            <div className="admin-datalist-wrap">
              <table className="admin-datalist">
                <thead>
                  <tr>
                    <th className="admin-datalist__col-expand" aria-label="Expand" />
                    <th className="admin-datalist__col-no">No</th>
                    <th>
                      <button type="button" className="admin-datalist__sort" onClick={() => toggleSort("name")}>
                        {invite.nameLabel} <span>{sortIcon("name")}</span>
                      </button>
                    </th>
                    <th>
                      <button type="button" className="admin-datalist__sort" onClick={() => toggleSort("phone")}>
                        {invite.phoneLabel} <span>{sortIcon("phone")}</span>
                      </button>
                    </th>
                    <th>
                      <button type="button" className="admin-datalist__sort" onClick={() => toggleSort("template")}>
                        Template <span>{sortIcon("template")}</span>
                      </button>
                    </th>
                    <th className="admin-datalist__col-msg">Isi Pesan</th>
                    <th>
                      <button type="button" className="admin-datalist__sort" onClick={() => toggleSort("created")}>
                        Ditambah <span>{sortIcon("created")}</span>
                      </button>
                    </th>
                    <th>Status</th>
                    <th className="admin-datalist__col-action">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedGuests.map((guest, index) => {
                    const templateId = getGuestTemplateId(guest.id);
                    const template = getInviteTemplateById(templates, templateId);
                    const preview = buildMessage(guest, templateId);
                    const waUrl = guest.phone ? buildWhatsAppUrl(guest.phone, preview) : null;
                    const inviteUrl = buildGuestInviteUrl(siteUrl, guest.slug);
                    const isExpanded = expandedId === guest.id;
                    const rowNo = (currentPage - 1) * pageSize + index + 1;
                    const hasPhone = Boolean(guest.phone?.trim());
                    const waSent = Boolean(guest.invite_sent_at);

                    return (
                      <Fragment key={guest.id}>
                        <tr
                          className={[
                            index % 2 === 1 ? "admin-datalist__row--stripe" : "",
                            isExpanded ? "admin-datalist__row--open" : "",
                          ]
                            .filter(Boolean)
                            .join(" ") || undefined}
                        >
                          <td>
                            <button
                              type="button"
                              className="admin-datalist__expand"
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? "Tutup detail" : "Buka detail"}
                              onClick={() => toggleExpand(guest.id)}
                            >
                              {isExpanded ? "▾" : "▸"}
                            </button>
                          </td>
                          <td className="admin-datalist__no">{rowNo}</td>
                          <td className="admin-datalist__name">{guest.display_name}</td>
                          <td className="admin-datalist__mono">{guest.phone || "—"}</td>
                          <td>{template.name}</td>
                          <td className="admin-datalist__msg">{truncate(preview)}</td>
                          <td className="admin-datalist__date">{formatDate(guest.created_at)}</td>
                          <td>
                            <span
                              className={`admin-datalist__status${waSent ? " admin-datalist__status--ok" : " admin-datalist__status--warn"}`}
                              title={
                                waSent
                                  ? formatDate(guest.invite_sent_at ?? undefined)
                                  : hasPhone
                                    ? invite.waUnsentLabel
                                    : invite.noPhone
                              }
                            >
                              {waSent ? invite.waSentLabel : invite.waUnsentLabel}
                            </span>
                          </td>
                          <td className="admin-datalist__actions-cell">
                            <div className="admin-datalist__row-actions">
                              {waUrl ? (
                                <button
                                  type="button"
                                  className="admin-datalist__action"
                                  title={invite.openWhatsApp}
                                  aria-label={invite.openWhatsApp}
                                  onClick={() => openWhatsAppAndMark(guest, waUrl)}
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
                                onClick={() => void handleDeleteGuest(guest)}
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
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
                                      onChange={(e) =>
                                        updateGuestField(guest.id, "display_name", e.target.value)
                                      }
                                    />
                                  </label>
                                  <label className="admin-field">
                                    <span className="admin-label">{invite.phoneLabel}</span>
                                    <input
                                      className="admin-input"
                                      value={guest.phone ?? ""}
                                      placeholder="081234567890"
                                      inputMode="tel"
                                      onChange={(e) => updateGuestField(guest.id, "phone", e.target.value)}
                                    />
                                  </label>
                                  <label className="admin-field">
                                    <span className="admin-label">{invite.templateSelectLabel}</span>
                                    <select
                                      className="admin-input"
                                      value={templateId}
                                      onChange={(e) => setGuestTemplate(guest.id, e.target.value)}
                                    >
                                      {templates.map((item) => (
                                        <option key={item.id} value={item.id}>
                                          {item.name}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                </div>

                                <div className="admin-datalist__detail-actions">
                                  <span className="admin-datalist__link" title={inviteUrl}>
                                    {inviteUrl}
                                  </span>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn--ghost admin-btn--sm"
                                    onClick={() => void copyLink(guest)}
                                  >
                                    {invite.copyLink}
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn--ghost admin-btn--sm"
                                    disabled={savingId === guest.id}
                                    onClick={() => void handleMarkInviteSent(guest, !waSent)}
                                  >
                                    {waSent ? invite.markWaUnsent : invite.markWaSent}
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn--ghost admin-btn--sm"
                                    disabled={savingId === guest.id}
                                    onClick={() => void handleUpdateGuest(guest)}
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn--ghost admin-btn--danger admin-btn--sm"
                                    disabled={savingId === guest.id}
                                    onClick={() => void handleDeleteGuest(guest)}
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
