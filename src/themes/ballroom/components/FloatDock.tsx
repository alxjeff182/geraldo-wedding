import { useState, type ReactNode } from "react";
import type { SheetId } from "../hooks/useSheet";
import { IconMail, IconPin, IconQris } from "../icons";

type Props = {
  visible: boolean;
  onOpen: (id: NonNullable<SheetId>) => void;
  labels: { rsvp: string; location: string; gift: string };
};

function usePress() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    handlers: {
      onPointerDown: () => setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onPointerCancel: () => setPressed(false),
    },
  };
}

function DockButton({
  className,
  tip,
  label,
  stacked,
  onClick,
  children,
}: {
  className?: string;
  tip: string;
  label: ReactNode;
  stacked?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { pressed, handlers } = usePress();
  return (
    <button
      type="button"
      className={`float-dock__btn${className ? ` ${className}` : ""}${
        pressed ? " is-pressed" : ""
      }`}
      data-tip={tip}
      onClick={onClick}
      aria-haspopup="dialog"
      {...handlers}
    >
      <span className="float-dock__glow" aria-hidden="true" />
      <span className="float-dock__icon" aria-hidden="true">
        {children}
      </span>
      <span className={`float-dock__label${stacked ? " float-dock__label--stack" : ""}`}>
        {label}
      </span>
    </button>
  );
}

export function FloatDock({ visible, onOpen, labels }: Props) {
  const giftParts = labels.gift.trim().split(/\s+/);
  const giftLabel =
    giftParts.length > 1 ? (
      <>
        {giftParts.slice(0, -1).join(" ")}
        <br />
        {giftParts.slice(-1)}
      </>
    ) : (
      labels.gift
    );

  return (
    <nav
      id="ballroom-dock"
      className={`float-dock${visible ? " is-visible" : ""}`}
      aria-label="Aksi cepat"
      hidden={!visible}
    >
      <DockButton tip="Konfirmasi hadir" label={labels.rsvp} onClick={() => onOpen("rsvp")}>
        <IconMail />
      </DockButton>
      <DockButton tip="Buka peta" label={labels.location} onClick={() => onOpen("location")}>
        <IconPin />
      </DockButton>
      <DockButton
        className="float-dock__btn--accent float-dock__btn--gift"
        tip="Kirim hadiah via QRIS / transfer bank"
        label={giftLabel}
        stacked={giftParts.length > 1}
        onClick={() => onOpen("gift")}
      >
        <IconQris />
      </DockButton>
    </nav>
  );
}
