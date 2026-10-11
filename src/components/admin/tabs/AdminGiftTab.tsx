import { AdminOverrideMediaField, AdminTextField } from "../AdminFields";
import { ImageUploader } from "../ImageUploader";
import { MEDIA_SPECS } from "../../../config/media-specs";
import type { GiftAccount, GiftSide } from "../../../config/wedding.config";
import type { AdminTabProps } from "../types";

const emptyAccount = (side: GiftSide = "bride"): GiftAccount => ({
  bank: "",
  number: "",
  holder: "",
  logo: "",
  side,
});

export function AdminGiftTab({ merged, defaults, updateDraft, clearDraftPath }: AdminTabProps) {
  const accounts = merged.gift.accounts;

  const setAccounts = (next: GiftAccount[]) => {
    updateDraft(["gift", "accounts"], next);
  };

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
      <AdminOverrideMediaField
        label="QRIS Mempelai Wanita"
        value={merged.gift.qrisBride || merged.gift.qris}
        defaultValue={defaults.gift.qrisBride || defaults.gift.qris}
        onReset={() => {
          clearDraftPath(["gift", "qrisBride"]);
          clearDraftPath(["gift", "qris"]);
        }}
      >
        <ImageUploader
          label=""
          folder="gift"
          spec={MEDIA_SPECS.qris}
          value={merged.gift.qrisBride || merged.gift.qris}
          onChange={(url) => {
            updateDraft(["gift", "qrisBride"], url);
            updateDraft(["gift", "qris"], url);
          }}
        />
      </AdminOverrideMediaField>
      <AdminOverrideMediaField
        label="QRIS Mempelai Pria"
        value={merged.gift.qrisGroom ?? ""}
        defaultValue={defaults.gift.qrisGroom ?? ""}
        onReset={() => clearDraftPath(["gift", "qrisGroom"])}
      >
        <ImageUploader
          label=""
          folder="gift"
          spec={MEDIA_SPECS.qris}
          value={merged.gift.qrisGroom ?? ""}
          onChange={(url) => updateDraft(["gift", "qrisGroom"], url)}
        />
      </AdminOverrideMediaField>
      {accounts.map((account, index) => (
        <fieldset key={index} className="admin-fieldset">
          <legend>
            Rekening Bank {index + 1}
            {account.side === "groom"
              ? " — Mempelai Pria"
              : account.side === "bride"
                ? " — Mempelai Wanita"
                : ""}
          </legend>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span className="admin-label">Untuk</span>
              <select
                className="admin-input"
                value={account.side ?? "bride"}
                onChange={(e) => {
                  const next = [...accounts];
                  next[index] = { ...next[index], side: e.target.value as GiftSide };
                  setAccounts(next);
                }}
              >
                <option value="bride">Mempelai Wanita</option>
                <option value="groom">Mempelai Pria</option>
              </select>
            </label>
            <label className="admin-field">
              <span className="admin-label">Bank</span>
              <input
                className="admin-input"
                value={account.bank}
                onChange={(e) => {
                  const next = [...accounts];
                  next[index] = { ...next[index], bank: e.target.value };
                  setAccounts(next);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Nomor</span>
              <input
                className="admin-input"
                value={account.number}
                onChange={(e) => {
                  const next = [...accounts];
                  next[index] = { ...next[index], number: e.target.value };
                  setAccounts(next);
                }}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Pemilik Rekening</span>
              <input
                className="admin-input"
                value={account.holder}
                onChange={(e) => {
                  const next = [...accounts];
                  next[index] = { ...next[index], holder: e.target.value };
                  setAccounts(next);
                }}
              />
            </label>
          </div>
          <ImageUploader
            label="Logo Bank"
            folder="gift"
            spec={MEDIA_SPECS.giftLogo}
            value={account.logo}
            onChange={(url) => {
              const next = [...accounts];
              next[index] = { ...next[index], logo: url };
              setAccounts(next);
            }}
          />
          {accounts.length > 1 ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--danger admin-btn--sm"
              onClick={() => setAccounts(accounts.filter((_, i) => i !== index))}
            >
              Hapus rekening
            </button>
          ) : null}
        </fieldset>
      ))}
      <div className="admin-inline-actions">
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => setAccounts([...accounts, emptyAccount("bride")])}
        >
          Tambah rekening wanita
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => setAccounts([...accounts, emptyAccount("groom")])}
        >
          Tambah rekening pria
        </button>
      </div>
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
            label="Toast Salin Rekening"
            value={merged.giftUi.copyAccountSuccess}
            onChange={(value) => updateDraft(["giftUi", "copyAccountSuccess"], value)}
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
