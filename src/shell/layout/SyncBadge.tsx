import { Badge } from "@mantine/core";
import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

const subscribeToNetwork = (onChange: () => void): (() => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

const isOnline = (): boolean => navigator.onLine;

export const SyncBadge = () => {
  const online = useSyncExternalStore(subscribeToNetwork, isOnline);
  const { t } = useTranslation("common");
  if (online) return null;
  return (
    <Badge
      size="lg"
      radius="xl"
      style={{
        backgroundColor: "var(--sw-highlight)",
        color: "var(--sw-ink-2)",
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      {t("offlinePill")}
    </Badge>
  );
};
