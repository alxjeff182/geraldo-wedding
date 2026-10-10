import { lazy, Suspense, useEffect, useState } from "react";
import { useWeddingContent } from "./context/use-wedding-content";
import { useGuestName } from "./hooks/useGuestName";
import { usePageMeta } from "./hooks/usePageMeta";
import { useAlertDialog } from "./hooks/useAlertDialog";
import { AlertDialog } from "./components/ui/AlertDialog";
import { BootScreen } from "./components/BootScreen";

const AdminPage = lazy(() => import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })));

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

  const logoSrc = content.media.logo || "/assets/ballroom/logo.webp";

  if (adminMode) {
    return (
      <Suspense fallback={<BootScreen logoSrc={logoSrc} label="Memuat admin…" />}>
        <AdminPage />
      </Suspense>
    );
  }

  if (guestLoading || contentLoading) {
    return (
      <BootScreen logoSrc={logoSrc} label="Memuat undangan…">
        <AlertDialog alert={alert} onClose={hideAlert} />
      </BootScreen>
    );
  }

  return (
    <Suspense fallback={<BootScreen logoSrc={logoSrc} label="Memuat undangan…" />}>
      <BallroomApp guestName={guestName} guestId={guestId} />
      <AlertDialog alert={alert} onClose={hideAlert} />
    </Suspense>
  );
}
