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
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gold px-5 py-2 text-sm font-medium text-maroon-dark shadow-lg"
    >
      {message}
    </div>
  );
}
