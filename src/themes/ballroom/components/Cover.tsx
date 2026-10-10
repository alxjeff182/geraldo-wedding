import { MediaImage } from "../../../components/MediaImage";

type Props = {
  guestName: string;
  salutation: string;
  dateLabel: string;
  openLabel: string;
  openAria: string;
  logoSrc: string;
  coverBg: string;
  onOpen: () => void;
  leaving: boolean;
};

export function Cover({
  guestName,
  salutation,
  dateLabel,
  openLabel,
  openAria,
  logoSrc,
  coverBg,
  onOpen,
  leaving,
}: Props) {
  return (
    <section className={`cover${leaving ? " is-leaving" : ""}`} aria-label="Pembuka undangan">
      <div className="cover__photo" aria-hidden="true">
        <MediaImage
          src={coverBg}
          alt=""
          width={720}
          height={1280}
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="cover__shade" aria-hidden="true" />
      <div className="cover__content">
        <div className="cover__logo-wrap">
          <MediaImage
            className="cover__logo"
            src={logoSrc}
            alt=""
            width={562}
            height={562}
            loading="eager"
          />
        </div>
        {guestName ? (
          <p className="cover__guest">
            <span className="cover__guest-label">{salutation}</span>
            <span className="cover__guest-name">{guestName}</span>
          </p>
        ) : null}
        <p className="cover__date">{dateLabel}</p>
        <button type="button" className="cover__cta" onClick={onOpen} aria-label={openAria}>
          <span className="cover__cta-ring" aria-hidden="true" />
          {openLabel}
        </button>
      </div>
    </section>
  );
}
