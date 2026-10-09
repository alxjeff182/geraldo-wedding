type IconProps = { size?: number; className?: string };

export function IconMail({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.25" y="6.5" width="15.5" height="11.5" rx="1.75" />
      <path d="M5 7.5 12 13l7-5.5" />
    </svg>
  );
}

export function IconPin({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5s-5.75-4.7-5.75-9.1a5.75 5.75 0 1 1 11.5 0c0 4.4-5.75 9.1-5.75 9.1z" />
      <circle cx="12" cy="11.4" r="2" />
    </svg>
  );
}

export function IconGift({ size = 18 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M4 13h16M12 10v10" />
      <path d="M12 10c-1.6-2.4-4.5-2.8-5.5-1.4C5.4 10 6.8 12 12 10c5.2 2 6.6 0 5.5-1.4C16.5 7.2 13.6 7.6 12 10z" />
    </svg>
  );
}

export function IconPinSm({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="1.5" />
      <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
    </svg>
  );
}

export function IconWhatsApp({ size = 18 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 3.2a8.3 8.3 0 0 0-7.15 12.5L3.4 20.6l5.05-1.32A8.3 8.3 0 1 0 12 3.2zm0 1.5a6.8 6.8 0 0 1 5.75 10.4l-.28.45.8 2.95-3.05-.8-.43.25A6.8 6.8 0 1 1 12 4.7zm3.86 8.7c-.18-.09-1.07-.53-1.24-.59-.17-.06-.29-.09-.42.09-.12.17-.48.59-.59.71-.11.12-.22.14-.4.05-.19-.09-.79-.29-1.5-.93-.55-.49-.93-1.1-1.04-1.28-.11-.18-.01-.28.08-.37.08-.08.18-.22.27-.33.09-.11.12-.19.18-.31.06-.12.03-.23-.01-.32-.05-.09-.42-1.01-.57-1.38-.15-.36-.3-.31-.42-.32h-.36c-.12 0-.32.05-.49.23-.17.18-.64.63-.64 1.53s.66 1.77.75 1.89c.09.12 1.29 1.97 3.13 2.76 1.84.79 1.84.53 2.17.5.33-.03 1.07-.44 1.22-.86.15-.42.15-.78.1-.86-.04-.08-.16-.13-.34-.22z" />
    </svg>
  );
}

export function IconCheck({ size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12.5 10 17.5 19 7.5" />
    </svg>
  );
}

export function IconX({ size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

export function IconSuccess({ size = 48 }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="24" cy="24" r="20" />
      <path d="M14.5 24.5 21 31l12.5-14" />
    </svg>
  );
}

export function IconChevronLeft({ size = 18 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

export function IconChevronRight({ size = 18 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  );
}

export function IconMusic({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
    </svg>
  );
}
