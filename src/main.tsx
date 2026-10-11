import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { WeddingContentProvider } from "./context/WeddingContentContext";
import { parseAppRoute } from "./lib/wa-desk-route";
import "./styles/boot.css";

const route = parseAppRoute(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WeddingContentProvider>
      <App route={route} />
    </WeddingContentProvider>
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").then((reg) => {
      // New deploy → take over immediately and reload once so guests don't keep stale UI.
      reg.addEventListener("updatefound", () => {
        const next = reg.installing;
        if (!next) return;
        next.addEventListener("statechange", () => {
          if (next.state === "installed" && navigator.serviceWorker.controller) {
            next.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    });
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}
