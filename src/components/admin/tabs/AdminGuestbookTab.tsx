import { AdminTextField } from "../AdminFields";
import { WishesModerationPanel } from "../WishesModerationPanel";
import type { AdminTabContentProps } from "../types";

export function AdminGuestbookTab({
  merged,
  updateDraft,
  setMessage,
}: Pick<AdminTabContentProps, "merged" | "updateDraft" | "setMessage">) {
  return (
    <div className="admin-form-grid">
      <label className="admin-field">
        <span className="admin-label">Tampilkan section Ucapan</span>
        <select
          className="admin-input"
          value={merged.guestbook.enabled ? "1" : "0"}
          onChange={(e) => updateDraft(["guestbook", "enabled"], e.target.value === "1")}
        >
          <option value="1">Ya</option>
          <option value="0">Tidak</option>
        </select>
      </label>
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
        label="Pesan Tanpa Link Tamu"
        wide
        value={merged.guestbook.lockedMessage}
        onChange={(value) => updateDraft(["guestbook", "lockedMessage"], value)}
      />
      <AdminTextField
        label="Pesan Batas Ucapan"
        wide
        value={merged.guestbook.limitReachedMessage}
        onChange={(value) => updateDraft(["guestbook", "limitReachedMessage"], value)}
      />
      <AdminTextField
        label="Label Sisa Ucapan"
        value={merged.guestbook.remainingLabel}
        onChange={(value) => updateDraft(["guestbook", "remainingLabel"], value)}
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

      <WishesModerationPanel onNotify={(text, options) => setMessage(text, options)} />
    </div>
  );
}
