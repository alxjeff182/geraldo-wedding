import { createPortal } from "react-dom";

type Props = {
  playing: boolean;
  onToggle: () => void;
};

function VinylIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3.5" fill="#fffcfb" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function StopCircleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

export function AudioPlayer({ playing, onToggle }: Props) {
  const button = (
    <button
      type="button"
      onClick={onToggle}
      className={`audio-toggle ${playing ? "audio-toggle--playing" : ""}`}
      aria-label={playing ? "Matikan musik" : "Putar musik"}
      aria-pressed={playing}
    >
      {playing ? <VinylIcon /> : <StopCircleIcon />}
    </button>
  );

  if (typeof document === "undefined") return button;
  return createPortal(button, document.body);
}
