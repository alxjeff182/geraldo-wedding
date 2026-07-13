import { useCallback, useEffect, useMemo, useState } from "react";
import type { InviteMessageTemplate } from "../../config/invite-templates";
import { getInviteTemplateById } from "../../config/invite-templates";
import type { WeddingConfig } from "../../config/wedding.config";
import {
  INVITE_TEMPLATE_VARIABLES,
  buildGuestInviteUrl,
  buildWhatsAppUrl,
  formatInviteMessage,
  slugifyGuestName,
} from "../../lib/invite-links";
import { getSupabase } from "../../lib/supabase";
import type { Guest } from "../../lib/supabase";
import { AdminTextField } from "./AdminFields";

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
  onNotify: (message: string) => void;
};

type GuestDraft = {
  display_name: string;
  phone: string;
  slug: string;
};

const emptyDraft = (): GuestDraft => ({
  display_name: "",
  phone: "",
  slug: "",
});

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
  const [slugTouched, setSlugTouched] = useState(false);
  const [templateByGuest, setTemplateByGuest] = useState<Record<string, string>>({});
  const [openTemplateId, setOpenTemplateId] = useState(invite.defaultTemplateId);

  const templates = invite.whatsappTemplates;

  const loadGuests = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("guests")
      .select("id, slug, display_name, phone, created_at")
      .order("display_name", { ascending: true });

    if (error) {
      onNotify(invite.guestError);
      setLoading(false);
      return;
    }

    setGuests(data ?? []);
    setLoading(false);
  }, [invite.guestError, onNotify]);

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (guest) =>
        guest.display_name.toLowerCase().includes(q) ||
        guest.slug.toLowerCase().includes(q) ||
        (guest.phone ?? "").toLowerCase().includes(q),
    );
  }, [guests, search]);

  const stats = useMemo(
    () => ({
      total: guests.length,
      withPhone: guests.filter((g) => g.phone?.trim()).length,
    }),
    [guests],
  );

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
    const slug = (newGuest.slug.trim() || slugifyGuestName(display_name)).toLowerCase();

    if (!display_name || !slug) return;

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
    setSlugTouched(false);
    onNotify(invite.guestAdded);
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

    const { error } = await supabase
      .from("guests")
      .update({
        display_name: guest.display_name.trim(),
        slug: guest.slug.trim().toLowerCase(),
        phone: guest.phone?.trim() || null,
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
    onNotify(invite.guestDeleted);
    await loadGuests();
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

  return (
    <div className="admin-invite">
      <header className="admin-invite__head">
        <div>
          <h3 className="admin-invite__title">{invite.listTitle}</h3>
          <p className="admin-invite__subtitle">{invite.listSubtitle}</p>
        </div>
        <div className="admin-invite__stats" aria-label="Ringkasan tamu">
          <span className="admin-invite__stat">
            <strong>{stats.total}</strong> tamu
          </span>
          <span className="admin-invite__stat">
            <strong>{stats.withPhone}</strong> punya nomor WA
          </span>
          <span className="admin-invite__stat">
            <strong>{templates.length}</strong> template
          </span>
        </div>
      </header>

      <fieldset className="admin-fieldset admin-invite__template">
        <legend>{invite.templateLabel}</legend>
        <p className="admin-invite__hint">{invite.templatesSubtitle}</p>
        <p className="admin-invite__hint">{invite.saveTemplateHint}</p>

        <label className="admin-field admin-field--wide">
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

        <AdminTextField
          label="Salam pembuka ({salam})"
          value={invite.salutation}
          onChange={onSalutationChange}
        />

        <div className="admin-invite__templates">
          {templates.map((template) => {
            const isOpen = openTemplateId === template.id;

            return (
              <details
                key={template.id}
                className="admin-invite__template-card"
                open={isOpen}
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) {
                    setOpenTemplateId(template.id);
                  }
                }}
              >
                <summary className="admin-invite__template-summary">{template.name}</summary>
                <div className="admin-invite__template-body">
                  <label className="admin-field admin-field--wide">
                    <span className="admin-label">{invite.templateNameLabel}</span>
                    <input
                      className="admin-input"
                      value={template.name}
                      onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                    />
                  </label>
                  <div className="admin-invite__vars">
                    {INVITE_TEMPLATE_VARIABLES.map((item) => (
                      <button
                        key={`${template.id}-${item.key}`}
                        type="button"
                        className="admin-invite__var"
                        onClick={() => appendVariableToTemplate(template.id, item.key)}
                      >
                        {`{${item.key}}`}
                      </button>
                    ))}
                  </div>
                  <label className="admin-field admin-field--wide">
                    <span className="admin-label">{invite.templateMessageLabel}</span>
                    <textarea
                      className="admin-input"
                      rows={10}
                      value={template.message}
                      onChange={(e) => updateTemplate(template.id, { message: e.target.value })}
                    />
                  </label>
                </div>
              </details>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="admin-fieldset admin-invite__add">
        <legend>Tambah Tamu Baru</legend>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">{invite.nameLabel}</span>
            <input
              className="admin-input"
              value={newGuest.display_name}
              placeholder="Budi Santoso"
              onChange={(e) => {
                const display_name = e.target.value;
                setNewGuest((prev) => ({
                  ...prev,
                  display_name,
                  slug: slugTouched ? prev.slug : slugifyGuestName(display_name),
                }));
              }}
            />
          </label>
          <label className="admin-field">
            <span className="admin-label">{invite.phoneLabel}</span>
            <input
              className="admin-input"
              value={newGuest.phone}
              placeholder="081234567890"
              inputMode="tel"
              onChange={(e) => setNewGuest((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </label>
          <label className="admin-field admin-field--wide">
            <span className="admin-label">{invite.slugLabel}</span>
            <input
              className="admin-input"
              value={newGuest.slug}
              placeholder="budi-santoso"
              onChange={(e) => {
                setSlugTouched(true);
                setNewGuest((prev) => ({ ...prev, slug: e.target.value }));
              }}
            />
          </label>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={adding || !newGuest.display_name.trim()}
          onClick={() => void handleAddGuest()}
        >
          {adding ? "Menyimpan..." : invite.addGuestButton}
        </button>
      </fieldset>

      <div className="admin-invite__toolbar">
        <input
          className="admin-input admin-invite__search"
          type="search"
          value={search}
          placeholder={invite.searchPlaceholder}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="admin-invite__loading">Memuat daftar tamu...</p>
      ) : filteredGuests.length === 0 ? (
        <p className="admin-invite__empty">{invite.emptyGuests}</p>
      ) : (
        <div className="admin-invite__list">
          <div className="admin-invite__row admin-invite__row--head" aria-hidden>
            <span>Tamu</span>
            <span>{invite.linkLabel}</span>
            <span>{invite.templateSelectLabel}</span>
          </div>

          {filteredGuests.map((guest) => {
            const templateId = getGuestTemplateId(guest.id);
            const inviteUrl = buildGuestInviteUrl(siteUrl, guest.slug);
            const preview = buildMessage(guest, templateId);
            const waUrl = guest.phone ? buildWhatsAppUrl(guest.phone, preview) : null;

            return (
              <article key={guest.id} className="admin-invite__row">
                <div className="admin-invite__guest">
                  <input
                    className="admin-input"
                    value={guest.display_name}
                    onChange={(e) => updateGuestField(guest.id, "display_name", e.target.value)}
                  />
                  <input
                    className="admin-input admin-invite__slug"
                    value={guest.slug}
                    onChange={(e) => updateGuestField(guest.id, "slug", e.target.value)}
                  />
                  <input
                    className="admin-input"
                    value={guest.phone ?? ""}
                    placeholder="081234567890"
                    inputMode="tel"
                    onChange={(e) => updateGuestField(guest.id, "phone", e.target.value)}
                  />
                  <details className="admin-invite__preview">
                    <summary>Preview pesan ({getInviteTemplateById(templates, templateId).name})</summary>
                    <pre>{preview}</pre>
                  </details>
                  <div className="admin-invite__row-actions admin-invite__row-actions--inline">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={savingId === guest.id}
                      onClick={() => void handleUpdateGuest(guest)}
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--danger"
                      disabled={savingId === guest.id}
                      onClick={() => void handleDeleteGuest(guest)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="admin-invite__link-col">
                  <input className="admin-input admin-invite__link" readOnly value={inviteUrl} />
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => void copyLink(guest)}
                  >
                    {invite.copyLink}
                  </button>
                </div>

                <div className="admin-invite__wa-col">
                  <label className="admin-field admin-field--wide">
                    <span className="admin-label">{invite.templateSelectLabel}</span>
                    <select
                      className="admin-input admin-invite__template-select"
                      value={templateId}
                      onChange={(e) => setGuestTemplate(guest.id, e.target.value)}
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn--whatsapp"
                    >
                      {invite.openWhatsApp}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn--whatsapp admin-btn--whatsapp-disabled"
                      disabled
                      title={invite.noPhone}
                    >
                      {invite.openWhatsApp}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
