import { useRef, useState, type ReactNode } from "react";
import type { GiftAccount, GiftSide } from "../../../config/wedding.config";
import { buildGiftWhatsappMessage, buildGuestWhatsAppUrl } from "../../../lib/guest-whatsapp";
import { IconCopy, IconWhatsApp } from "../icons";

type Props = {
  title: string;
  description: string;
  accounts: GiftAccount[];
  qris?: string;
  qrisBride?: string;
  qrisGroom?: string;
  brideName: string;
  groomName: string;
  physicalAddress?: string;
  physicalGiftTitle?: string;
  copyAddressButton?: string;
  copyAddressSuccess?: string;
  copySuccess: string;
  copyError: string;
  waNumber: string;
  waTemplate: string;
  guestName: string;
  coupleTitle: string;
  onToast: (msg: string) => void;
  /** When true, omit outer section chrome (used inside GiftSheet) */
  embedded?: boolean;
  onTabChange?: (tab: "qris" | "bank") => void;
};

const QRIS_FALLBACK = "/assets/ballroom/qris-dummy.svg";

function resolveQris(
  side: GiftSide,
  qrisBride?: string,
  qrisGroom?: string,
  legacyQris?: string,
): string {
  const bride = qrisBride?.trim() || legacyQris?.trim() || "";
  const groom = qrisGroom?.trim() || "";
  if (side === "bride") return bride || QRIS_FALLBACK;
  return groom || bride || QRIS_FALLBACK;
}

export function GiftHub({
  title,
  description,
  accounts,
  qris,
  qrisBride,
  qrisGroom,
  brideName,
  groomName,
  physicalAddress,
  physicalGiftTitle = "Alamat kirim",
  copyAddressButton = "Salin Alamat",
  copyAddressSuccess,
  copySuccess,
  copyError,
  waNumber,
  waTemplate,
  guestName,
  coupleTitle,
  onToast,
  embedded = false,
  onTabChange,
}: Props) {
  const [tab, setTab] = useState<"qris" | "bank">("qris");
  const [side, setSide] = useState<GiftSide>("bride");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef(0);

  const qrisSrc = resolveQris(side, qrisBride, qrisGroom, qris);
  const isDummy = /qris-dummy/i.test(qrisSrc);
  const sideName = side === "bride" ? brideName : groomName;
  const sideAccounts = accounts.filter((account) => {
    if (!account.number?.trim()) return false;
    if (!account.side) return side === "bride";
    return account.side === side;
  });

  const selectTab = (next: "qris" | "bank") => {
    setTab(next);
    onTabChange?.(next);
  };

  const copy = async (value: string, key: string, successMsg = copySuccess) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      onToast(successMsg);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      onToast(copyError);
    }
  };

  const waHref = buildGuestWhatsAppUrl(
    waNumber,
    buildGiftWhatsappMessage(waTemplate, {
      nama: guestName || "Tamu",
      metode: tab === "qris" ? `QRIS (${sideName})` : `Transfer Bank (${sideName})`,
      pasangan: coupleTitle,
    }),
  );

  const personSeg = (
    <div className="seg seg--person" role="tablist" aria-label="Pilih mempelai">
      <button
        type="button"
        className={`seg__btn${side === "bride" ? " is-active" : ""}`}
        role="tab"
        aria-selected={side === "bride"}
        onClick={() => setSide("bride")}
      >
        Mempelai Wanita
      </button>
      <button
        type="button"
        className={`seg__btn${side === "groom" ? " is-active" : ""}`}
        role="tab"
        aria-selected={side === "groom"}
        onClick={() => setSide("groom")}
      >
        Mempelai Pria
      </button>
    </div>
  );

  const panels: ReactNode = (
    <>
      <div className="seg" role="tablist" aria-label="Metode hadiah">
        <button
          type="button"
          className={`seg__btn${tab === "qris" ? " is-active" : ""}`}
          role="tab"
          aria-selected={tab === "qris"}
          onClick={() => selectTab("qris")}
        >
          QRIS
        </button>
        <button
          type="button"
          className={`seg__btn${tab === "bank" ? " is-active" : ""}`}
          role="tab"
          aria-selected={tab === "bank"}
          onClick={() => selectTab("bank")}
        >
          {embedded ? "Transfer" : "Transfer Bank"}
        </button>
      </div>

      {personSeg}

      {tab === "qris" ? (
        <div className="gift-panel is-active" role="tabpanel">
          <div className="qris-frame">
            <img src={qrisSrc} alt={`Kode QRIS ${sideName}`} width={280} height={280} />
          </div>
          <p className="qris-name">a.n. {sideName}</p>
          {isDummy ? (
            <p className="qris-dummy-note">QRIS sementara — ganti lewat CMS (tab Gift)</p>
          ) : (
            <a className="gift-link" href={qrisSrc} download>
              Simpan QRIS
            </a>
          )}
        </div>
      ) : (
        <div className="gift-panel is-active" role="tabpanel">
          {sideAccounts.length === 0 ? (
            <p className="qris-dummy-note">
              Rekening {sideName} belum diisi — lengkapi lewat CMS (tab Gift).
            </p>
          ) : (
            sideAccounts.map((account) => {
              const key = `${account.side ?? "bride"}-${account.bank}-${account.number}`;
              const isCopied = copiedKey === key;
              return (
                <article key={key} className="bank-card">
                  <p className="bank-card__bank">{account.bank}</p>
                  <p className="bank-card__number num">{account.number}</p>
                  <div className="bank-card__bottom">
                    <p className="bank-card__name">a.n. {account.holder}</p>
                    <button
                      type="button"
                      className={`copy-btn${isCopied ? " is-copied" : ""}`}
                      onClick={() => void copy(account.number.replace(/\s/g, ""), key)}
                    >
                      <IconCopy />
                      <span>{isCopied ? "Tersalin" : "Salin"}</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
          {physicalAddress ? (
            <div className="gift-address">
              <span className="gift-address__label">{physicalGiftTitle}</span>
              <p className="gift-address__text">{physicalAddress}</p>
              <button
                type="button"
                className={`copy-btn${copiedKey === "address" ? " is-copied" : ""}`}
                onClick={() =>
                  void copy(physicalAddress, "address", copyAddressSuccess ?? copySuccess)
                }
              >
                <IconCopy />
                <span>{copiedKey === "address" ? "Tersalin" : copyAddressButton}</span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );

  if (embedded) return panels;

  return (
    <section id="gift" className="section gift">
      <div className="section__head">
        <p className="eyebrow">Hadiah</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </div>
      <p className="gift__lead">{description}</p>
      <div className="gift-hub">
        {panels}
        <div className="gift-or" aria-hidden="true">
          <span>atau</span>
        </div>
        <div className="gift-confirm">
          {waHref ? (
            <a className="btn btn--wa" href={waHref} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp />
              <span>Konfirmasi via WhatsApp</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
