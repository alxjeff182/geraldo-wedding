import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/** Fixed overlay aligned to the invitation column so FABs sit in true corners. */
export function InviteFabs({ children }: { children: ReactNode }) {
  const node = <div className="invite-fabs">{children}</div>;
  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
