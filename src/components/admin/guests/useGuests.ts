import { useCallback, useEffect, useMemo, useState } from "react";
import { getInviteTemplateById } from "../../../config/invite-templates";
import type { WeddingConfig } from "../../../config/wedding.config";
import {
  allocateUniqueSlug,
  bulkRowsReady,
  parseGuestBulkCsv,
  parseGuestBulkText,
  phoneAlreadyTakenMessage,
  phoneUniquenessKey,
  type BulkGuestRow,
} from "../../../lib/guest-bulk";
import {
  buildGuestInviteUrl,
  buildWhatsAppUrl,
  formatInviteMessage,
  slugifyGuestName,
} from "../../../lib/invite-links";
import { getSupabase, type Guest } from "../../../lib/supabase";
import {
  BULK_INSERT_CHUNK,
  emptyGuestDraft,
  formatInviteLabel,
  PAGE_SIZES,
  type GuestDraft,
  type SentFilter,
  type SortDir,
  type SortKey,
} from "./guest-invite-utils";

type InviteCopy = WeddingConfig["invite"];

export type UseGuestsOptions = {
  invite: InviteCopy;
  siteUrl: string;
  coupleTitle: string;
  dateLabel: string;
  location: string;
  acaraSummary?: string;
  venueSummary?: string;
  onNotify: (message: string, options?: { retry?: () => void }) => void;
};

export function useGuests({
  invite,
  siteUrl,
  coupleTitle,
  dateLabel,
  location,
  acaraSummary = "",
  venueSummary = "",
  onNotify,
}: UseGuestsOptions) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newGuest, setNewGuest] = useState<GuestDraft>(emptyGuestDraft());
  const [search, setSearch] = useState("");
  const [sentFilter, setSentFilter] = useState<SentFilter>("all");
  const [templateByGuest, setTemplateByGuest] = useState<Record<string, string>>({});
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
  const existingSlugs = useMemo(() => guests.map((g) => g.slug), [guests]);
  const existingPhones = useMemo(() => {
    const keys: string[] = [];
    for (const g of guests) {
      const key = phoneUniquenessKey(g.phone);
      if (key) keys.push(key);
    }
    return keys;
  }, [guests]);
  const existingPhoneOwners = useMemo(() => {
    const owners: Record<string, string> = {};
    for (const g of guests) {
      const key = phoneUniquenessKey(g.phone);
      if (key && !owners[key]) owners[key] = g.display_name;
    }
    return owners;
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

  const getGuestTemplateId = useCallback(
    (guestId: string) => templateByGuest[guestId] ?? invite.defaultTemplateId,
    [templateByGuest, invite.defaultTemplateId],
  );

  const buildMessage = useCallback(
    (guest: Pick<Guest, "display_name" | "slug">, templateId: string) => {
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
        acara: acaraSummary,
        venue: venueSummary,
      });
    },
    [
      templates,
      siteUrl,
      dateLabel,
      location,
      coupleTitle,
      invite.salutation,
      acaraSummary,
      venueSummary,
    ],
  );

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = !q
      ? guests
      : guests.filter(
          (guest) =>
            guest.display_name.toLowerCase().includes(q) ||
            guest.slug.toLowerCase().includes(q) ||
            (guest.phone ?? "").toLowerCase().includes(q),
        );
    if (sentFilter === "sent") {
      list = list.filter((guest) => Boolean(guest.invite_sent_at));
    } else if (sentFilter === "unsent") {
      list = list.filter((guest) => !guest.invite_sent_at);
    }

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
        cmp = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [guests, search, sentFilter, sortKey, sortDir, templates, getGuestTemplateId]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedGuests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGuests.slice(start, start + pageSize);
  }, [filteredGuests, currentPage, pageSize]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
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
      onNotify(phoneAlreadyTakenMessage(existingPhoneOwners[phoneKey]));
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

    setNewGuest(emptyGuestDraft());
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
        ? parseGuestBulkCsv(raw, {
            existingSlugs,
            existingPhones,
            existingPhoneOwners,
          })
        : parseGuestBulkText(raw, {
            existingSlugs,
            existingPhones,
            existingPhoneOwners,
          });
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

    if (phoneKey) {
      const owner = guests.find(
        (g) => g.id !== guest.id && phoneUniquenessKey(g.phone) === phoneKey,
      );
      if (owner) {
        onNotify(phoneAlreadyTakenMessage(owner.display_name));
        setSavingId(null);
        return;
      }
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

  const sendNextUnsent = () => {
    const next = guests.find((guest) => !guest.invite_sent_at && guest.phone);
    if (!next) {
      onNotify("Semua tamu dengan nomor WA sudah ditandai terkirim.");
      return;
    }
    const templateId = getGuestTemplateId(next.id);
    const message = buildMessage(next, templateId);
    const waUrl = buildWhatsAppUrl(next.phone ?? "", message);
    if (!waUrl) {
      onNotify(invite.noPhone);
      return;
    }
    openWhatsAppAndMark(next, waUrl);
  };

  const copyLink = async (guest: Guest) => {
    try {
      await navigator.clipboard.writeText(buildGuestInviteUrl(siteUrl, guest.slug));
      onNotify(invite.copyLinkSuccess);
    } catch {
      onNotify(invite.guestError);
    }
  };

  const previewAsGuest = (guest: Guest) => {
    const url = new URL("/", window.location.origin);
    url.searchParams.set("guest", guest.slug);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
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

  return {
    invite,
    templates,
    loading,
    savingId,
    adding,
    newGuest,
    setNewGuest,
    search,
    setSearch,
    sentFilter,
    setSentFilter,
    expandedId,
    pageSize,
    setPageSize,
    bulkOpen,
    setBulkOpen,
    bulkText,
    setBulkText,
    bulkRows,
    bulkImporting,
    bulkReady,
    bulkErrorCount,
    filteredGuests,
    pagedGuests,
    currentPage,
    totalPages,
    pageNumbers,
    stats,
    getGuestTemplateId,
    buildMessage,
    handleAddGuest,
    resetBulk,
    handleBulkPreview,
    handleBulkCsvFile,
    handleBulkImport,
    handleUpdateGuest,
    handleDeleteGuest,
    handleMarkInviteSent,
    openWhatsAppAndMark,
    sendNextUnsent,
    copyLink,
    previewAsGuest,
    updateGuestField,
    setGuestTemplate,
    toggleSort,
    sortIcon,
    toggleExpand,
    setPage,
    siteUrl,
  };
}

export type GuestsController = ReturnType<typeof useGuests>;
