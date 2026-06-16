import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../../services/repos/attachmentsRepo.ts";
import { RemoveButton } from "../RemoveButton.tsx";

interface VideoItemProps {
  attachment: Attachment;
  onRemove: () => void;
}

export const VideoItem = ({ attachment, onRemove }: VideoItemProps) => {
  const { t } = useTranslation("attachments");
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        backgroundColor: "var(--sw-paper-2)",
        border: "1px solid var(--sw-line)",
      }}
    >
      <video
        src={attachment.url ?? ""}
        poster={attachment.thumbUrl ?? undefined}
        controls
        preload="metadata"
        aria-label={attachment.name ?? t("kind.video")}
        style={{ display: "block", width: "100%", maxHeight: 280 }}
      />
      <RemoveButton onRemove={onRemove} label={t("remove")} overlay />
    </div>
  );
};
