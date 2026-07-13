import { AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { AdminTabProps } from "../types";

export function AdminGiftTab({ merged, updateDraft }: AdminTabProps) {
  return (
    <div className="admin-stack">
      <AdminTextField
        label="Judul"
        value={merged.gift.title}
        onChange={(value) => updateDraft(["gift", "title"], value)}
      />
      <AdminTextField
        label="Deskripsi"
        wide
        value={merged.gift.description}
        onChange={(value) => updateDraft(["gift", "description"], value)}
        rows={3}
      />
      <label className="admin-field">
        <span className="admin-label">Alamat Kado Fisik</span>
        <textarea
          className="admin-input"
          rows={2}
          value={merged.gift.physicalAddress}
          onChange={(e) => updateDraft(["gift", "physicalAddress"], e.target.value)}
        />
      </label>
      {merged.gift.accounts[0] && (
        <fieldset className="admin-fieldset">
          <legend>Rekening Bank</legend>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span className="admin-label">Bank</span>
              <input
                className="admin-input"
                value={merged.gift.accounts[0].bank}
                onChange={(e) => {
                  const accounts = [...merged.gift.accounts];
                  accounts[0] = { ...accounts[0], bank: e.target.value };
                  updateDraft(["gift", "accounts"], accounts);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Nomor</span>
              <input
                className="admin-input"
                value={merged.gift.accounts[0].number}
                onChange={(e) => {
                  const accounts = [...merged.gift.accounts];
                  accounts[0] = { ...accounts[0], number: e.target.value };
                  updateDraft(["gift", "accounts"], accounts);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Pemilik Rekening</span>
              <input
                className="admin-input"
                value={merged.gift.accounts[0].holder}
                onChange={(e) => {
                  const accounts = [...merged.gift.accounts];
                  accounts[0] = { ...accounts[0], holder: e.target.value };
                  updateDraft(["gift", "accounts"], accounts);
                }}
              />
            </label>
          </div>
          <ImageUploader
            label="Logo Bank"
            folder="gift"
            spec={MEDIA_SPECS.giftLogo}
            value={merged.gift.accounts[0].logo}
            onChange={(url) => {
              const accounts = [...merged.gift.accounts];
              accounts[0] = { ...accounts[0], logo: url };
              updateDraft(["gift", "accounts"], accounts);
            }}
          />
        </fieldset>
      )}
      <fieldset className="admin-fieldset">
        <legend>Caption & Tombol</legend>
        <div className="admin-form-grid">
          <AdminTextField
            label="Tombol Buka Amplop"
            value={merged.giftUi.openButton}
            onChange={(value) => updateDraft(["giftUi", "openButton"], value)}
          />
          <AdminTextField
            label="Label Bank"
            value={merged.giftUi.bankLabel}
            onChange={(value) => updateDraft(["giftUi", "bankLabel"], value)}
          />
          <AdminTextField
            label="Label Nomor Rekening"
            value={merged.giftUi.accountNumberLabel}
            onChange={(value) => updateDraft(["giftUi", "accountNumberLabel"], value)}
          />
          <AdminTextField
            label="Prefix a.n"
            value={merged.giftUi.accountHolderPrefix}
            onChange={(value) => updateDraft(["giftUi", "accountHolderPrefix"], value)}
          />
          <AdminTextField
            label="Tombol Salin Rekening"
            value={merged.giftUi.copyAccountButton}
            onChange={(value) => updateDraft(["giftUi", "copyAccountButton"], value)}
          />
          <AdminTextField
            label="Judul Kado Fisik"
            value={merged.giftUi.physicalGiftTitle}
            onChange={(value) => updateDraft(["giftUi", "physicalGiftTitle"], value)}
          />
          <AdminTextField
            label="Tombol Salin Alamat"
            value={merged.giftUi.copyAddressButton}
            onChange={(value) => updateDraft(["giftUi", "copyAddressButton"], value)}
          />
          <AdminTextField
            label="Toast Salin Rekening"
            value={merged.giftUi.copyAccountSuccess}
            onChange={(value) => updateDraft(["giftUi", "copyAccountSuccess"], value)}
          />
          <AdminTextField
            label="Toast Salin Alamat"
            value={merged.giftUi.copyAddressSuccess}
            onChange={(value) => updateDraft(["giftUi", "copyAddressSuccess"], value)}
          />
          <AdminTextField
            label="Toast Gagal Salin"
            value={merged.giftUi.copyError}
            onChange={(value) => updateDraft(["giftUi", "copyError"], value)}
          />
        </div>
      </fieldset>
    </div>
  );
}
