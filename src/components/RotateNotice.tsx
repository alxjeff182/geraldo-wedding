type Props = {
  logoSrc?: string;
};

const DEFAULT_LOGO = "/assets/ballroom/logo.webp";

export function RotateNotice({ logoSrc = DEFAULT_LOGO }: Props) {
  return (
    <div className="rotate-notice" role="alert" aria-live="polite">
      <div className="rotate-notice__inner">
        <img
          className="rotate-notice__logo"
          src={logoSrc}
          alt=""
          width={120}
          height={120}
          draggable={false}
        />
        <div className="rotate-notice__phone" aria-hidden="true">
          <svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="6"
              y="2"
              width="52"
              height="92"
              rx="8"
              stroke="currentColor"
              strokeWidth="3"
            />
            <circle cx="32" cy="82" r="3.5" fill="currentColor" />
            <rect x="24" y="8" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.45" />
          </svg>
        </div>
        <p className="rotate-notice__title">Putar HP Anda</p>
        <p className="rotate-notice__hint">
          Undangan ini paling nyaman dilihat dalam mode portrait
        </p>
      </div>
    </div>
  );
}
