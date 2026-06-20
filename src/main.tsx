import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "./styles/tokens.css";
import "./styles/global.css";

const root = createRoot(document.getElementById("root")!);

if (window.location.pathname.startsWith("/s/")) {
  void import("./public/PublicApp.tsx").then(({ PublicApp }) => {
    root.render(
      <StrictMode>
        <PublicApp />
      </StrictMode>,
    );
  });
} else {
  void import("./Root.tsx").then(({ Root }) => {
    root.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );
  });
}
