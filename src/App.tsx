import { lazy, Suspense, useEffect, useState } from "react";
import { useWeddingContent } from "./context/WeddingContentContext";
import { useGuestName } from "./hooks/useGuestName";
import { usePageMeta } from "./hooks/usePageMeta";
import { useAlertDialog } from "./hooks/useAlertDialog";
import { AlertDialog } from "./components/ui/AlertDialog";

const AdminPage = lazy(() =>
  import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);

const BallroomApp = lazy(() =>
  import("./themes/ballroom/BallroomApp").then((m) => ({ default: m.BallroomApp })),
);

type AppProps = {
  adminMode?: boolean;
};

export default function App({ adminMode = false }: AppProps) {
  const { content, loading: contentLoading, loadError, refresh } = useWeddingContent();
  const { guestName, guestId, loading: guestLoading } = useGuestName();
  const [bootStuck, setBootStuck] = useState(false);
  const { alert, showError, hideAlert } = useAlertDialog();

  usePageMeta(content);

  useEffect(() => {
    if (!contentLoading && !guestLoading) {
      setBootStuck(false);
      return;
    }
    const timer = window.setTimeout(() => setBootStuck(true), 15000);
    return () => window.clearTimeout(timer);
  }, [contentLoading, guestLoading]);

  useEffect(() => {
    if (loadError) {
      showError(loadError, {
        title: "Gagal memuat undangan",
        actionLabel: "Coba lagi",
        onAction: () => void refresh(),
      });
    }
  }, [loadError, refresh, showError]);

  useEffect(() => {
    if (!bootStuck) return;
    showError("Memuat undangan terlalu lama. Periksa koneksi internet Anda.", {
      title: "Loading stuck",
      actionLabel: "Muat ulang",
      onAction: () => window.location.reload(),
    });
  }, [bootStuck, showError]);

  if (adminMode) {
    return (
      <Suspense fallback={<div className="boot-screen">Memuat admin...</div>}>
        <AdminPage />
      </Suspense>
    );
  }

  if (guestLoading || contentLoading) {
    return (
      <div className="boot-screen">
        <p>Memuat undangan...</p>
        <AlertDialog alert={alert} onClose={hideAlert} />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="boot-screen">Memuat undangan...</div>}>
      <BallroomApp guestName={guestName} guestId={guestId} />
      <AlertDialog alert={alert} onClose={hideAlert} />
    </Suspense>
  );
}
