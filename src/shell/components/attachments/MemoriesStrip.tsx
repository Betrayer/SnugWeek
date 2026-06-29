import { Text, UnstyledButton } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../services/repos/attachmentsRepo.ts";
import {
  retainTargetKey,
  useAttachmentsStore,
  type RetainTarget,
} from "../../../state/attachmentsStore.ts";
import { useAuthStore } from "../../../state/authStore.ts";
import { FileGlyph, LinkGlyph, MicGlyph, PlayGlyph, VideoGlyph } from "../icons/glyphs.tsx";
import { cropImageStyle } from "./cropStyle.ts";

interface MemoriesStripProps {
  weekId: string;
  day: number;
  onOpen: () => void;
}

const MAX_THUMBS = 6;

const tileStyle = {
  width: 40,
  height: 40,
  flex: "0 0 auto",
  borderRadius: "var(--mantine-radius-sm)",
  overflow: "hidden",
  backgroundColor: "var(--sw-paper-2)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--sw-ink-3)",
} as const;

const Thumb = ({ attachment }: { attachment: Attachment }) => {
  const poster =
    attachment.kind === "image"
      ? (attachment.thumbUrl ?? attachment.url)
      : attachment.thumbUrl;
  if ((attachment.kind === "image" || attachment.kind === "video") && poster) {
    return (
      <span style={{ ...tileStyle, position: "relative" }}>
        <img
          src={poster}
          alt=""
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            ...(attachment.kind === "image"
              ? cropImageStyle(attachment)
              : { objectFit: "cover" }),
          }}
        />
        {attachment.kind === "video" && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--sw-card)",
            }}
          >
            <PlayGlyph size={16} />
          </span>
        )}
      </span>
    );
  }
  const icon =
    attachment.kind === "audio" ? (
      <MicGlyph size={16} />
    ) : attachment.kind === "video" ? (
      <VideoGlyph size={16} />
    ) : attachment.kind === "link" ? (
      <LinkGlyph size={16} />
    ) : (
      <FileGlyph size={16} />
    );
  return <span style={tileStyle}>{icon}</span>;
};

export const MemoriesStrip = ({ weekId, day, onOpen }: MemoriesStripProps) => {
  const { t } = useTranslation("attachments");
  const uid = useAuthStore((state) => state.uid);
  const retainTarget = useMemo<RetainTarget>(
    () => ({ type: "week", weekId }),
    [weekId],
  );

  useEffect(() => {
    if (!uid) return undefined;
    const store = useAttachmentsStore.getState();
    store.retain(uid, retainTarget);
    return () => store.release(retainTarget);
  }, [uid, retainTarget]);

  const slice = useAttachmentsStore(
    (state) => state.byKey[retainTargetKey(retainTarget)],
  );
  const items = useMemo(
    () => (slice ?? []).filter((item) => item.day === day),
    [slice, day],
  );

  if (items.length === 0) return null;

  const shown = items.slice(0, MAX_THUMBS);
  const extra = items.length - shown.length;

  return (
    <UnstyledButton
      onClick={onOpen}
      aria-label={t("memories")}
      style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}
    >
      {shown.map((item) => (
        <Thumb key={item.id} attachment={item} />
      ))}
      {extra > 0 && (
        <Text fz="xs" fw={700} c="var(--sw-ink-3)">
          +{extra}
        </Text>
      )}
    </UnstyledButton>
  );
};
