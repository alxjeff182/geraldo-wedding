type IconProps = { size?: number; className?: string };

export function IconMail({ size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.25" y="6.5" width="15.5" height="11.5" rx="1.75" />
      <path d="M5 7.5 12 13l7-5.5" />
    </svg>
  );
}

export function IconPin({ size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.5s-5.75-4.7-5.75-9.1a5.75 5.75 0 1 1 11.5 0c0 4.4-5.75 9.1-5.75 9.1z" />
      <circle cx="12" cy="11.4" r="2" />
    </svg>
  );
}

export function IconGift({ size = 18 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M4 13h16M12 10v10" />
      <path d="M12 10c-1.6-2.4-4.5-2.8-5.5-1.4C5.4 10 6.8 12 12 10c5.2 2 6.6 0 5.5-1.4C16.5 7.2 13.6 7.6 12 10z" />
    </svg>
  );
}

export function IconPinSm({ size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 20.5s-5.5-4.5-5.5-8.7a5.5 5.5 0 1 1 11 0c0 4.2-5.5 8.7-5.5 8.7z" />
      <circle cx="12" cy="11.8" r="1.8" />
    </svg>
  );
}

export function IconQris({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M3.5 3.5h7.25v7.25H3.5zm1.65 1.65v3.95h3.95V5.15z" />
      <path d="M5.9 5.9h2.45v2.45H5.9z" />
      <path d="M13.25 3.5H20.5v7.25h-7.25zm1.65 1.65v3.95H18.85V5.15z" />
      <path d="M15.65 5.9h2.45v2.45h-2.45z" />
      <path d="M3.5 13.25h7.25V20.5H3.5zm1.65 1.65v3.95h3.95v-3.95z" />
      <path d="M5.9 15.65h2.45v2.45H5.9z" />
      <rect x="13.25" y="13.25" width="2.4" height="2.4" rx="0.3" />
      <rect x="16.55" y="13.25" width="3.95" height="2.4" rx="0.3" />
      <rect x="13.25" y="16.55" width="3.95" height="2.4" rx="0.3" />
      <rect x="18.1" y="16.55" width="2.4" height="3.95" rx="0.3" />
      <rect x="13.25" y="19.75" width="2.4" height="0.75" rx="0.2" />
    </svg>
  );
}

export function IconCopy({ size = 14 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="11" height="11" rx="1.5" />
      <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
    </svg>
  );
}

export function IconInstagram({ size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 1.75a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
    </svg>
  );
}

export function IconWhatsApp({ size = 20, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Official WhatsApp glyph (Simple Icons) — crisp bubble + handset */}
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function IconCheck({ size = 14 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12.5 10 17.5 19 7.5" />
    </svg>
  );
}

export function IconX({ size = 14 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

export function IconSuccess({ size = 48 }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="20" />
      <path d="M14.5 24.5 21 31l12.5-14" />
    </svg>
  );
}

export function IconChevronLeft({ size = 18 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

export function IconChevronRight({ size = 18 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  );
}

export function IconMusic({ size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
    </svg>
  );
}

export function IconMusicOff({ size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
      <path d="m3 3 18 18" />
    </svg>
  );
}
