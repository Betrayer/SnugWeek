import { Badge } from "@mantine/core";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import {
  isPendingWrite,
  subscribePendingWrites,
} from "../../services/syncSignal.ts";
import { useOnlineStatus } from "../hooks/useOnlineStatus.ts";

const SYNCED_VISIBLE_MS = 1500;

export const SyncBadge = () => {
  const { t } = useTranslation("common");
  const online = useOnlineStatus();
  const pending = useSyncExternalStore(subscribePendingWrites, isPendingWrite);
  const [showSynced, setShowSynced] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    const previous = wasPending.current;
    wasPending.current = pending;
    if (previous && !pending && online) {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), SYNCED_VISIBLE_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [pending, online]);

  if (!online) {
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
  }

  if (pending) {
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
        {t("sync.pending")}
      </Badge>
    );
  }

  if (showSynced) {
    return (
      <Badge
        size="lg"
        radius="xl"
        variant="transparent"
        style={{
          color: "var(--sw-ink-3)",
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        {t("sync.synced")}
      </Badge>
    );
  }

  return null;
};
