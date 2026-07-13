import { useState } from "react";
import { useWeddingContent } from "../../context/WeddingContentContext";

type Props = {
  onCopy: (message: string) => void;
};

function GiftIcon() {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden>
      <path d="M32 448v-80c0-8.8 7.2-16 16-16h96v80c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32v-80h96c8.8 0 16 7.2 16 16v80c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32zM176 288c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v208c0 8.8-7.2 16-16 16h-48zm144 0c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v208c0 8.8-7.2 16-16 16h-48zM96 64c0-35.3 28.7-64 64-64s64 28.7 64 64v32H96V64zm192 0c0-35.3 28.7-64 64-64s64 28.7 64 64v32H288V64z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden>
      <path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h128l96 96v176c0 8.8-7.2 16-16 16zm-128-96V64h-64v256h192V160h-96c-8.8 0-16-7.2-16-16zm96-32V0H192c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64V160h-64z" />
    </svg>
  );
}

function GiftsIcon() {
  return (
    <svg viewBox="0 0 640 512" fill="currentColor" aria-hidden>
      <path d="M192 64c0-35.3 28.7-64 64-64s64 28.7 64 64v64h-64V64zM320 64v64h64c0-35.3-28.7-64-64-64zM256 128H64c-35.3 0-64 28.7-64 64v64c0 17.7 14.3 32 32 32h32v96c0 53 43 96 96 96h96c53 0 96-43 96-96v-96h32c17.7 0 32-14.3 32-32v-64c0-35.3-28.7-64-64-64H384V64c0-70.7-57.3-128-128-128S128-6.7 128 64v64H256zm192 96v96c0 35.3-28.7 64-64 64H256c-35.3 0-64-28.7-64-64v-96h256z" />
    </svg>
  );
}

export function Gift({ onCopy }: Props) {
  const { content } = useWeddingContent();
  const [open, setOpen] = useState(false);
  const account = content.gift.accounts[0];

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopy(message);
    } catch {
      onCopy(content.giftUi.copyError);
    }
  };

  return (
    <section className="section-gift-wrap" aria-labelledby="gift-heading">
      <div className="section-card">
        <h2 id="gift-heading" className="section-card__title">
          {content.gift.title}
        </h2>
        <p className="section-card__subtitle">{content.gift.description}</p>

        <button
          type="button"
          className="btn-gold mt-5"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="gift-amplop"
        >
          <GiftIcon />
          {content.giftUi.openButton}
        </button>

        {open && (
          <div id="gift-amplop" className="gift-amplop">
            <div className="gift-amplop__card">
              <img
                src={account.logo}
                alt={`Logo Bank ${account.bank}`}
                className="gift-amplop__logo"
                loading="lazy"
                width={200}
                height={84}
              />

              <div className="gift-amplop__text">
                <p>
                  {content.giftUi.bankLabel} {account.bank}
                </p>
                <p>
                  {content.giftUi.accountNumberLabel} {account.number}
                </p>
                <p>
                  {content.giftUi.accountHolderPrefix}{" "}
                  <strong>{account.holder}</strong>
                </p>
              </div>

              <button
                type="button"
                className="btn-copy"
                onClick={() => void copyText(account.number, content.giftUi.copyAccountSuccess)}
              >
                <CopyIcon />
                {content.giftUi.copyAccountButton}
              </button>

              <div className="gift-amplop__divider" aria-hidden>
                <span />
                <GiftsIcon />
                <span />
              </div>

              <div className="gift-amplop__text">
                <p>{content.giftUi.physicalGiftTitle}</p>
                <p>{content.gift.physicalAddress}</p>
                <p>
                  {content.giftUi.accountHolderPrefix}{" "}
                  <strong>{account.holder}</strong>
                </p>
              </div>

              <button
                type="button"
                className="btn-copy"
                onClick={() =>
                  void copyText(content.gift.physicalAddress, content.giftUi.copyAddressSuccess)
                }
              >
                <CopyIcon />
                {content.giftUi.copyAddressButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
