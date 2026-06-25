import { Button, Group, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { notifyInfo } from "../../../services/notify.ts";
import type { Attachment } from "../../../services/repos/attachmentsRepo.ts";
import { useAttachmentsStore } from "../../../state/attachmentsStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { Lightbox } from "./Lightbox.tsx";
import { AudioItem } from "./items/AudioItem.tsx";
import { FileItem } from "./items/FileItem.tsx";
import { ImageItem } from "./items/ImageItem.tsx";
import { LinkItem } from "./items/LinkItem.tsx";
import { VideoItem } from "./items/VideoItem.tsx";

interface AttachmentGridProps {
  attachments: Attachment[];
}

export const AttachmentGrid = ({ attachments }: AttachmentGridProps) => {
  const { t } = useTranslation(["attachments", "common"]);
  const remove = useAttachmentsStore((state) => state.remove);
  const weekReady = useWeekStore((state) => state.status === "ready");
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [pendingDelete, setPendingDelete] = useState<Attachment | null>(null);

  const images = attachments.filter((item) => item.kind === "image");
  const others = attachments.filter((item) => item.kind !== "image");

  const pin = (attachment: Attachment) => {
    useWeekStore.getState().addPhotoDecoration(attachment);
    notifyInfo("attachments:pinnedToast");
  };

  const requestRemove = (attachment: Attachment) => {
    if (attachment.kind === "link") {
      remove(attachment);
      return;
    }
    setPendingDelete(attachment);
  };

  const confirmRemove = () => {
    if (pendingDelete) remove(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <Stack gap="sm">
      {images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(82px, 1fr))",
            gap: 8,
          }}
        >
          {images.map((image, index) => (
            <ImageItem
              key={image.id}
              attachment={image}
              onOpen={() => setLightboxIndex(index)}
              onRemove={() => requestRemove(image)}
              onPin={weekReady ? () => pin(image) : undefined}
            />
          ))}
        </div>
      )}

      {others.map((attachment) => {
        if (attachment.kind === "audio") {
          return (
            <AudioItem
              key={attachment.id}
              attachment={attachment}
              onRemove={() => requestRemove(attachment)}
            />
          );
        }
        if (attachment.kind === "video") {
          return (
            <VideoItem
              key={attachment.id}
              attachment={attachment}
              onRemove={() => requestRemove(attachment)}
            />
          );
        }
        if (attachment.kind === "link") {
          return (
            <LinkItem
              key={attachment.id}
              attachment={attachment}
              onRemove={() => requestRemove(attachment)}
            />
          );
        }
        return (
          <FileItem
            key={attachment.id}
            attachment={attachment}
            onRemove={() => requestRemove(attachment)}
          />
        );
      })}

      <Lightbox
        images={images}
        index={lightboxIndex}
        onIndex={setLightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onPin={
          weekReady
            ? (attachment) => {
                pin(attachment);
                setLightboxIndex(-1);
              }
            : undefined
        }
      />

      <ResponsiveDialog
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={t("deleteTitle")}
      >
        <Stack gap="md">
          <Text c="var(--sw-ink-2)">{t("deleteWarning")}</Text>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              c="var(--sw-ink-2)"
              onClick={() => setPendingDelete(null)}
            >
              {t("common:cancel")}
            </Button>
            <Button color="var(--sw-danger)" onClick={confirmRemove}>
              {t("delete")}
            </Button>
          </Group>
        </Stack>
      </ResponsiveDialog>
    </Stack>
  );
};
