import { useState } from "react";
import { GiftHub } from "../components/GiftHub";
import { useWeddingContent } from "../../../context/WeddingContentContext";
import {
  buildGiftWhatsappMessage,
  buildGuestWhatsAppUrl,
} from "../../../lib/guest-whatsapp";
import { IconGift, IconWhatsApp } from "../icons";

type Props = {
  open: boolean;
  guestName: string;
  onClose: () => void;
  setSheetRef: (el: HTMLElement | null) => void;
  onToast: (msg: string) => void;
};

export function GiftSheet({ open, guestName, onClose, setSheetRef, onToast }: Props) {
  const { content } = useWeddingContent();
  const [metode, setMetode] = useState("QRIS");

  const waHref = buildGuestWhatsAppUrl(
    content.contact.whatsappNumber,
    buildGiftWhatsappMessage(content.contact.giftWhatsappTemplate, {
      nama: guestName || "Tamu",
      metode,
      pasangan: content.site.title,
    }),
  );

  return (
    <section
      ref={setSheetRef}
      className={`sheet${open ? " is-open" : ""}`}
      id="sheet-gift"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheetGiftTitle"
      tabIndex={-1}
      hidden={!open}
    >
      <div className="sheet__handle" aria-hidden="true" />
      <button type="button" className="sheet__close" aria-label="Tutup" onClick={onClose}>
        ×
      </button>
      <header className="sheet__head">
        <span className="sheet__badge" aria-hidden="true">
          <IconGift size={18} />
        </span>
        <p className="eyebrow">Tanda Kasih</p>
        <h3 id="sheetGiftTitle">Kirim Hadiah</h3>
        <p className="sheet__sub">QRIS atau transfer bank</p>
      </header>
      <div className="sheet__body">
        <GiftHub
          title={content.gift.title}
          description={content.gift.description}
          accounts={[...content.gift.accounts]}
          qris={content.gift.qris}
          physicalAddress={content.gift.physicalAddress}
          copySuccess={content.giftUi.copyAccountSuccess}
          copyError={content.giftUi.copyError}
          waNumber={content.contact.whatsappNumber}
          waTemplate={content.contact.giftWhatsappTemplate}
          guestName={guestName}
          coupleTitle={content.site.title}
          onToast={onToast}
          embedded
          onTabChange={(tab) => setMetode(tab === "qris" ? "QRIS" : "Transfer Bank")}
        />
      </div>
      {waHref ? (
        <footer className="sheet__foot">
          <a className="btn btn--wa sheet__cta" href={waHref} target="_blank" rel="noopener noreferrer">
            <IconWhatsApp />
            <span>Konfirmasi via WhatsApp</span>
          </a>
        </footer>
      ) : null}
    </section>
  );
}
