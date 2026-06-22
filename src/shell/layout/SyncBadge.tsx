import { Badge } from "@mantine/core";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import {
  isPendingWrite,
  subscribePendingWrites,
} from "../../services/syncSignal.ts";
import { useIsMobile } from "../hooks/useIsMobile.ts";
import { useOnlineStatus } from "../hooks/useOnlineStatus.ts";

const SYNCED_VISIBLE_MS = 1500;

const pillStyle = {
  backgroundColor: "var(--sw-highlight)",
  color: "var(--sw-ink-2)",
  textTransform: "none",
  fontWeight: 600,
} as const;

const Dot = ({
  color,
  filled,
  label,
}: {
  color: string;
  filled: boolean;
  label: string;
}) => (
  <span
    role="img"
    aria-label={label}
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      boxSizing: "border-box",
      backgroundColor: filled ? color : "transparent",
      border: filled ? undefined : `2px solid ${color}`,
      flex: "0 0 auto",
    }}
  />
);

export const SyncBadge = () => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
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
    return isMobile ? (
      <Dot color="var(--sw-ink-3)" filled={false} label={t("offlinePill")} />
    ) : (
      <Badge size="lg" radius="xl" style={pillStyle}>
        {t("offlinePill")}
      </Badge>
    );
  }

  if (pending) {
    return isMobile ? (
      <Dot color="var(--sw-accent)" filled label={t("sync.pending")} />
    ) : (
      <Badge size="lg" radius="xl" style={pillStyle}>
        {t("sync.pending")}
      </Badge>
    );
  }

  if (showSynced && !isMobile) {
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
