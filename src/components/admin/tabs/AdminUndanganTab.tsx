import { GuestInvitePanel } from "../GuestInvitePanel";
import { AdminOverrideBooleanSelect, AdminOverrideTextField, AdminTextField } from "../AdminFields";
import type { AdminTabProps } from "../types";

type AdminUndanganTabProps = AdminTabProps & {
  setMessage: (text: string | null, options?: { retry?: () => void }) => void;
};

export function AdminUndanganTab({
  merged,
  defaults,
  updateDraft,
  clearDraftPath,
  setMessage,
}: AdminUndanganTabProps) {
  const acaraSummary = merged.events.map((event) => `${event.name} ${event.time}`).join(" · ");
  const venueSummary = merged.events.map((event) => event.venue).join(" · ");

  return (
    <div className="admin-stack">
      <fieldset className="admin-fieldset">
        <legend>Situs & SEO</legend>
        <div className="admin-form-grid">
          <AdminOverrideTextField
            label="URL undangan (untuk link share)"
            wide
            value={merged.site.url}
            defaultValue={defaults.site.url}
            onReset={() => clearDraftPath(["site", "url"])}
            onChange={(value) => updateDraft(["site", "url"], value)}
          />
          <AdminOverrideBooleanSelect
            label="Sembunyikan dari mesin pencari (noindex)"
            value={merged.site.noIndex}
            defaultValue={defaults.site.noIndex}
            onReset={() => clearDraftPath(["site", "noIndex"])}
            onChange={(value) => updateDraft(["site", "noIndex"], value)}
            falseOption="Indeks (live)"
            trueOption="Noindex (staging / preview)"
          />
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>WhatsApp Tamu (RSVP & Gift)</legend>
        <div className="admin-form-grid">
          <AdminOverrideTextField
            label="Nomor WhatsApp pasangan (62…)"
            value={merged.contact.whatsappNumber}
            defaultValue={defaults.contact.whatsappNumber}
            onReset={() => clearDraftPath(["contact", "whatsappNumber"])}
            onChange={(value) => updateDraft(["contact", "whatsappNumber"], value)}
          />
          {merged.contact.whatsappNumber.includes("81234567890") ? (
            <p className="admin-field-hint" style={{ gridColumn: "1 / -1", margin: 0 }}>
              Nomor masih dummy — ganti ke WA pasangan sebelum undangan live.
            </p>
          ) : null}
          <label className="admin-field">
            <span className="admin-label">Aktifkan WA setelah RSVP</span>
            <select
              className="admin-input"
              value={merged.contact.rsvpWhatsappEnabled ? "1" : "0"}
              onChange={(e) =>
                updateDraft(["contact", "rsvpWhatsappEnabled"], e.target.value === "1")
              }
            >
              <option value="1">Ya</option>
              <option value="0">Tidak</option>
            </select>
          </label>
          <AdminTextField
            label="Template WA RSVP"
            wide
            rows={4}
            value={merged.contact.rsvpWhatsappTemplate}
            onChange={(value) => updateDraft(["contact", "rsvpWhatsappTemplate"], value)}
          />
          <AdminTextField
            label="Template WA Konfirmasi Gift"
            wide
            rows={3}
            value={merged.contact.giftWhatsappTemplate}
            onChange={(value) => updateDraft(["contact", "giftWhatsappTemplate"], value)}
          />
        </div>
      </fieldset>

      <GuestInvitePanel
        invite={merged.invite}
        siteUrl={merged.site.url}
        coupleTitle={merged.site.title}
        dateLabel={merged.dateLabel}
        location={merged.location}
        acaraSummary={acaraSummary}
        venueSummary={venueSummary}
        onTemplatesChange={(value) => updateDraft(["invite", "whatsappTemplates"], value)}
        onDefaultTemplateChange={(value) => updateDraft(["invite", "defaultTemplateId"], value)}
        onSalutationChange={(value) => updateDraft(["invite", "salutation"], value)}
        onNotify={(text, options) => setMessage(text, options)}
      />
    </div>
  );
}
