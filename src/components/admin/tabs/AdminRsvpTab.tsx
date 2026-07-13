import { AdminStringListField, AdminTextField } from "../AdminFields";
import { RsvpSubmissionsPanel } from "../RsvpSubmissionsPanel";
import type { AdminTabProps } from "../types";

type AdminRsvpTabProps = AdminTabProps & {
  setMessage: (text: string | null) => void;
};

export function AdminRsvpTab({ merged, updateDraft, setMessage }: AdminRsvpTabProps) {
  return (
    <div className="admin-stack">
      <fieldset className="admin-fieldset">
        <legend>Pengaturan Form RSVP</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Judul"
            value={merged.rsvp.title}
            onChange={(value) => updateDraft(["rsvp", "title"], value)}
          />
          <AdminTextField
            label="Subtitle"
            wide
            value={merged.rsvp.subtitle}
            onChange={(value) => updateDraft(["rsvp", "subtitle"], value)}
          />
          <AdminTextField
            label="Label Nama"
            value={merged.rsvp.nameLabel}
            onChange={(value) => updateDraft(["rsvp", "nameLabel"], value)}
          />
          <AdminTextField
            label="Placeholder Nama"
            value={merged.rsvp.namePlaceholder}
            onChange={(value) => updateDraft(["rsvp", "namePlaceholder"], value)}
          />
          <AdminTextField
            label="Label Kehadiran"
            value={merged.rsvp.attendanceLabel}
            onChange={(value) => updateDraft(["rsvp", "attendanceLabel"], value)}
          />
          <AdminTextField
            label="Label Hadir"
            value={merged.rsvp.attendanceHadir}
            onChange={(value) => updateDraft(["rsvp", "attendanceHadir"], value)}
          />
          <AdminTextField
            label="Label Tidak Hadir"
            value={merged.rsvp.attendanceTidak}
            onChange={(value) => updateDraft(["rsvp", "attendanceTidak"], value)}
          />
          <AdminTextField
            label="Label Ragu"
            value={merged.rsvp.attendanceRagu}
            onChange={(value) => updateDraft(["rsvp", "attendanceRagu"], value)}
          />
          <AdminTextField
            label="Label Jumlah Tamu"
            value={merged.rsvp.guestCountLabel}
            onChange={(value) => updateDraft(["rsvp", "guestCountLabel"], value)}
          />
          <AdminTextField
            label="Placeholder Jumlah Tamu"
            value={merged.rsvp.guestCountPlaceholder}
            onChange={(value) => updateDraft(["rsvp", "guestCountPlaceholder"], value)}
          />
          <AdminStringListField
            label="Opsi Jumlah Tamu (pisah koma)"
            value={merged.rsvp.guestCountOptions}
            onChange={(value) => updateDraft(["rsvp", "guestCountOptions"], value)}
          />
          <AdminTextField
            label="Tombol Submit"
            value={merged.rsvp.submit}
            onChange={(value) => updateDraft(["rsvp", "submit"], value)}
          />
          <AdminTextField
            label="Tombol Submitting"
            value={merged.rsvp.submitting}
            onChange={(value) => updateDraft(["rsvp", "submitting"], value)}
          />
          <AdminTextField
            label="Catatan Bawah Form"
            wide
            value={merged.rsvp.note}
            onChange={(value) => updateDraft(["rsvp", "note"], value)}
          />
          <AdminTextField
            label="Pesan Sukses"
            wide
            value={merged.rsvp.successMessage}
            onChange={(value) => updateDraft(["rsvp", "successMessage"], value)}
          />
          <AdminTextField
            label="Pesan Error"
            wide
            value={merged.rsvp.errorMessage}
            onChange={(value) => updateDraft(["rsvp", "errorMessage"], value)}
          />
        </div>
      </fieldset>

      <RsvpSubmissionsPanel rsvp={merged.rsvp} onNotify={(text) => setMessage(text)} />
    </div>
  );
}
