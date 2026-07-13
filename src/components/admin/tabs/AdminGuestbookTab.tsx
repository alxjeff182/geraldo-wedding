import { AdminTextField } from "../AdminFields";
import type { AdminTabProps } from "../types";

export function AdminGuestbookTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-form-grid">
      <AdminTextField
        label="Judul"
        value={merged.guestbook.title}
        onChange={(value) => updateDraft(["guestbook", "title"], value)}
      />
      <AdminTextField
        label="Subtitle"
        wide
        value={merged.guestbook.subtitle}
        onChange={(value) => updateDraft(["guestbook", "subtitle"], value)}
      />
      <AdminTextField
        label="Placeholder Nama"
        value={merged.guestbook.namePlaceholder}
        onChange={(value) => updateDraft(["guestbook", "namePlaceholder"], value)}
      />
      <AdminTextField
        label="Placeholder Ucapan"
        value={merged.guestbook.messagePlaceholder}
        onChange={(value) => updateDraft(["guestbook", "messagePlaceholder"], value)}
      />
      <AdminTextField
        label="Tombol Kirim"
        value={merged.guestbook.submit}
        onChange={(value) => updateDraft(["guestbook", "submit"], value)}
      />
      <AdminTextField
        label="Tombol Mengirim"
        value={merged.guestbook.submitting}
        onChange={(value) => updateDraft(["guestbook", "submitting"], value)}
      />
      <AdminTextField
        label="Pesan Kosong"
        wide
        value={merged.guestbook.emptyMessage}
        onChange={(value) => updateDraft(["guestbook", "emptyMessage"], value)}
      />
      <AdminTextField
        label="Pager Sebelumnya"
        value={merged.guestbook.pagerPrev}
        onChange={(value) => updateDraft(["guestbook", "pagerPrev"], value)}
      />
      <AdminTextField
        label="Pager Selanjutnya"
        value={merged.guestbook.pagerNext}
        onChange={(value) => updateDraft(["guestbook", "pagerNext"], value)}
      />
      <AdminTextField
        label="Pesan Sukses"
        wide
        value={merged.guestbook.successMessage}
        onChange={(value) => updateDraft(["guestbook", "successMessage"], value)}
      />
      <AdminTextField
        label="Pesan Error"
        wide
        value={merged.guestbook.errorMessage}
        onChange={(value) => updateDraft(["guestbook", "errorMessage"], value)}
      />
    </div>
  );
}
