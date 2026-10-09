import { useEffect } from "react";

type Props = {
  message: string;
  onClose: () => void;
};

export function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(id);
  }, [onClose, message]);

  return (
    <div role="status" aria-live="polite" className="toast is-show">
      {message}
    </div>
  );
}
