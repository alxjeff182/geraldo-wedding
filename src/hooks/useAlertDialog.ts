import { useCallback, useState } from "react";
import {
  alertTitleForTone,
  notifyToAlert,
  type AlertDialogState,
  type AlertTone,
} from "../lib/alert-dialog";

export function useAlertDialog() {
  const [alert, setAlert] = useState<AlertDialogState | null>(null);

  const hideAlert = useCallback(() => setAlert(null), []);

  const showAlert = useCallback((next: AlertDialogState) => {
    setAlert(next);
  }, []);

  const showError = useCallback(
    (message: string, options?: { title?: string; actionLabel?: string; onAction?: () => void }) => {
      setAlert({
        tone: "error",
        title: options?.title ?? alertTitleForTone("error"),
        message,
        actionLabel: options?.actionLabel ?? (options?.onAction ? "Coba lagi" : "Mengerti"),
        onAction: options?.onAction,
      });
    },
    [],
  );

  const showSuccess = useCallback((message: string, title?: string) => {
    setAlert({
      tone: "success",
      title: title ?? alertTitleForTone("success"),
      message,
      actionLabel: "Mengerti",
    });
  }, []);

  const showFromNotify = useCallback((message: string) => {
    setAlert(notifyToAlert(message));
  }, []);

  const showTone = useCallback((tone: AlertTone, message: string, title?: string) => {
    setAlert({
      tone,
      title: title ?? alertTitleForTone(tone),
      message,
      actionLabel: "Mengerti",
    });
  }, []);

  return {
    alert,
    showAlert,
    showError,
    showSuccess,
    showFromNotify,
    showTone,
    hideAlert,
  };
}
