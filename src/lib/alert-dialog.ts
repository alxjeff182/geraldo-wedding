export type AlertTone = "error" | "success" | "warning" | "info";

export type AlertDialogState = {
  tone: AlertTone;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function alertTitleForTone(tone: AlertTone): string {
  if (tone === "success") return "Berhasil";
  if (tone === "warning") return "Perhatian";
  if (tone === "info") return "Informasi";
  return "Terjadi kesalahan";
}

export function isSuccessNotify(message: string): boolean {
  return /berhasil|disimpan|tersalin|diimpor|terkirim|ditandai|diekspor/i.test(message);
}

export function notifyToAlert(message: string): Omit<AlertDialogState, "onAction"> {
  const success = isSuccessNotify(message);
  return {
    tone: success ? "success" : "error",
    title: alertTitleForTone(success ? "success" : "error"),
    message,
    actionLabel: "Mengerti",
  };
}
