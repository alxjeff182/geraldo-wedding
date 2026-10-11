import { lazy, Suspense, useEffect, useState } from "react";
import { useWeddingContent } from "./context/use-wedding-content";
import { useGuestName } from "./hooks/useGuestName";
import { usePageMeta } from "./hooks/usePageMeta";
import { useAlertDialog } from "./hooks/useAlertDialog";
import { AlertDialog } from "./components/ui/AlertDialog";
import { BootScreen } from "./components/BootScreen";
import { RotateNotice } from "./components/RotateNotice";
import type { AppRoute } from "./lib/wa-desk-route";

const AdminPage = lazy(() => import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })));

const WaDeskPage = lazy(() =>
  import("./pages/WaDeskPage").then((m) => ({ default: m.WaDeskPage })),
);

const BallroomApp = lazy(() =>
  import("./themes/ballroom/BallroomApp").then((m) => ({ default: m.BallroomApp })),
);

type AppProps = {
  route?: AppRoute;
  /** @deprecated use route */
  adminMode?: boolean;
};

export default function App({ route, adminMode = false }: AppProps) {
  const resolvedRoute: AppRoute = route ?? (adminMode ? { kind: "admin" } : { kind: "invite" });
  const { content, loading: contentLoading, loadError, refresh } = useWeddingContent();
  const { guestName, guestId, loading: guestLoading } = useGuestName();
  const [bootStuck, setBootStuck] = useState(false);
  const { alert, showError, hideAlert } = useAlertDialog();

  usePageMeta(content, {
    noIndex: resolvedRoute.kind === "admin" || resolvedRoute.kind === "wa-desk",
  });

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

  if (resolvedRoute.kind === "admin") {
    return (
      <Suspense fallback={<BootScreen logoSrc={logoSrc} label="Memuat admin…" />}>
        <AdminPage />
      </Suspense>
    );
  }

  if (resolvedRoute.kind === "wa-desk") {
    return (
      <Suspense fallback={<BootScreen logoSrc={logoSrc} label="Memuat meja WA…" />}>
        <WaDeskPage token={resolvedRoute.token} />
      </Suspense>
    );
  }

  if (guestLoading || contentLoading) {
    return (
      <>
        <BootScreen logoSrc={logoSrc} label="Memuat undangan…">
          <AlertDialog alert={alert} onClose={hideAlert} />
        </BootScreen>
        <RotateNotice logoSrc={logoSrc} />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<BootScreen logoSrc={logoSrc} label="Memuat undangan…" />}>
        <BallroomApp guestName={guestName} guestId={guestId} />
        <AlertDialog alert={alert} onClose={hideAlert} />
      </Suspense>
      <RotateNotice logoSrc={logoSrc} />
    </>
  );
}
