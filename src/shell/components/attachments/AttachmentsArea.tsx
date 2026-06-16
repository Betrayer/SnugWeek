import { Group, Progress, Stack, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { notifyInfo } from "../../../services/notify.ts";
import { newAttachmentId } from "../../../services/repos/attachmentsRepo.ts";
import {
  MAX_ATTACHMENTS,
  retainTargetKey,
  useAttachmentsStore,
  type AddTarget,
  type RetainTarget,
} from "../../../state/attachmentsStore.ts";
import { useAuthStore } from "../../../state/authStore.ts";
import { useOnlineStatus } from "../../hooks/useOnlineStatus.ts";
import { EmptyState } from "../common/EmptyState.tsx";
import { SparkleDoodle } from "../common/doodles.tsx";
import { AttachmentAdder } from "./AttachmentAdder.tsx";
import { AttachmentGrid } from "./AttachmentGrid.tsx";
import type { UploadProgress } from "./useAttachmentUploads.ts";
import { useAttachmentUploads } from "./useAttachmentUploads.ts";

type Scope = "task" | "list" | "day";

interface AttachmentsAreaProps {
  scope: Scope;
  taskId?: string;
  listId?: string;
  weekId?: string;
  day?: number;
}

const UploadRow = ({ item }: { item: UploadProgress }) => {
  const { t } = useTranslation("attachments");
  return (
    <Stack gap={2}>
      <Group justify="space-between" gap="sm" wrap="nowrap">
        <Text fz="xs" c="var(--sw-ink-3)" truncate style={{ flex: 1 }}>
          {item.name}
        </Text>
        <Text fz="xs" c={item.failed ? "var(--sw-danger)" : "var(--sw-ink-3)"}>
          {item.failed ? t("uploadError") : t("uploading")}
        </Text>
      </Group>
      <Progress
        value={item.failed ? 100 : Math.round(item.fraction * 100)}
        size="xs"
        radius="xl"
        color={item.failed ? "var(--sw-danger)" : "var(--sw-accent)"}
        styles={{ root: { backgroundColor: "var(--sw-line)" } }}
      />
    </Stack>
  );
};

const AttachmentsPanel = ({
  retainTarget,
  addTarget,
  scope,
  day,
}: {
  retainTarget: RetainTarget;
  addTarget: AddTarget;
  scope: Scope;
  day?: number;
}) => {
  const { t } = useTranslation("attachments");
  const uid = useAuthStore((state) => state.uid);
  const online = useOnlineStatus();
  const uploads = useAttachmentUploads(addTarget);
  const subKey = retainTargetKey(retainTarget);
  const slice = useAttachmentsStore((state) => state.byKey[subKey]);
  const [dragOver, setDragOver] = useState(false);
  const { addImageFiles, addGenericFiles } = uploads;

  useEffect(() => {
    if (!uid) return undefined;
    const store = useAttachmentsStore.getState();
    store.retain(uid, retainTarget);
    return () => store.release(retainTarget);
  }, [uid, retainTarget]);

  useEffect(() => {
    if (scope !== "task" || !online) return undefined;
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter(
        (file) => file.type.startsWith("image/"),
      );
      if (files.length > 0) addImageFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [scope, online, addImageFiles]);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (!online) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    const images = files.filter((file) => file.type.startsWith("image/"));
    const rest = files.filter((file) => !file.type.startsWith("image/"));
    if (images.length > 0) addImageFiles(images);
    if (rest.length > 0) addGenericFiles(rest);
  };

  const attachments = useMemo(() => {
    const list = slice ?? [];
    return scope === "day" ? list.filter((item) => item.day === day) : list;
  }, [slice, scope, day]);

  const addLink = (fields: {
    href: string;
    title: string;
    previewImage: string | null;
  }) => {
    if (!uid) return;
    const added = useAttachmentsStore.getState().add(addTarget, {
      id: newAttachmentId(uid),
      kind: "link",
      href: fields.href,
      title: fields.title,
      previewImage: fields.previewImage,
    });
    if (!added) notifyInfo("attachments:limitReached", { max: MAX_ATTACHMENTS });
  };

  const isEmpty = attachments.length === 0 && uploads.uploads.length === 0;

  return (
    <Stack
      gap="sm"
      onDragOver={(event) => {
        if (!online) return;
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        outline: dragOver ? "2px dashed var(--sw-accent)" : "none",
        outlineOffset: 4,
      }}
    >
      <Group justify="space-between" gap="xs">
        <AttachmentAdder
          variant="panel"
          online={online}
          onImages={uploads.addImageFiles}
          onAudioFiles={uploads.addAudioFiles}
          onVideoFiles={uploads.addVideoFiles}
          onFiles={uploads.addGenericFiles}
          onRecording={uploads.addRecording}
          onAddLink={addLink}
        />
      </Group>

      {uploads.uploads.length > 0 && (
        <Stack gap={8}>
          {uploads.uploads.map((item) => (
            <UploadRow key={item.tempId} item={item} />
          ))}
        </Stack>
      )}

      {attachments.length > 0 && <AttachmentGrid attachments={attachments} />}

      {isEmpty && (
        <EmptyState icon={<SparkleDoodle size={40} />} label={t(`empty.${scope}`)} />
      )}
    </Stack>
  );
};

export const AttachmentsArea = ({
  scope,
  taskId,
  listId,
  weekId,
  day,
}: AttachmentsAreaProps) => {
  const retainTarget = useMemo<RetainTarget | null>(() => {
    if (scope === "task" && taskId) return { type: "task", taskId };
    if (scope === "list" && listId) return { type: "list", listId };
    if (scope === "day" && weekId) return { type: "week", weekId };
    return null;
  }, [scope, taskId, listId, weekId]);

  const addTarget = useMemo<AddTarget | null>(() => {
    if (scope === "task" && taskId) return { type: "task", taskId };
    if (scope === "list" && listId) return { type: "list", listId };
    if (scope === "day" && weekId && day) return { type: "day", weekId, day };
    return null;
  }, [scope, taskId, listId, weekId, day]);

  if (!retainTarget || !addTarget) return null;

  return (
    <AttachmentsPanel
      retainTarget={retainTarget}
      addTarget={addTarget}
      scope={scope}
      day={day}
    />
  );
};
