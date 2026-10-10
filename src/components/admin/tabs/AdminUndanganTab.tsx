import { GuestInvitePanel } from "../GuestInvitePanel";
import { AdminTextField } from "../AdminFields";
import type { AdminTabProps } from "../types";

type AdminUndanganTabProps = AdminTabProps & {
  setMessage: (text: string | null, options?: { retry?: () => void }) => void;
};

export function AdminUndanganTab({ merged, updateDraft, setMessage }: AdminUndanganTabProps) {
  const acaraSummary = merged.events
    .map((event) => `${event.name} ${event.time}`)
    .join(" · ");
  const venueSummary = merged.events.map((event) => event.venue).join(" · ");

  return (
    <div className="admin-stack">
      <fieldset className="admin-fieldset">
        <legend>Situs & SEO</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="URL undangan (untuk link share)"
            wide
            value={merged.site.url}
            onChange={(value) => updateDraft(["site", "url"], value)}
          />
          <label className="admin-field">
            <span className="admin-label">Sembunyikan dari mesin pencari (noindex)</span>
            <select
              className="admin-input"
              value={merged.site.noIndex ? "1" : "0"}
              onChange={(e) => updateDraft(["site", "noIndex"], e.target.value === "1")}
            >
              <option value="0">Indeks (live)</option>
              <option value="1">Noindex (staging / preview)</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>WhatsApp Tamu (RSVP & Gift)</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Nomor WhatsApp pasangan (62…)"
            value={merged.contact.whatsappNumber}
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
