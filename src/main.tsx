import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { WeddingContentProvider } from "./context/WeddingContentContext";
import "./styles/boot.css";

const isAdminRoute = window.location.pathname === "/admin" || window.location.pathname === "/admin/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WeddingContentProvider>
      <App adminMode={isAdminRoute} />
    </WeddingContentProvider>
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
