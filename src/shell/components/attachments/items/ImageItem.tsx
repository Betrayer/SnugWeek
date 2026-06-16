import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../../services/repos/attachmentsRepo.ts";
import { RemoveButton } from "../RemoveButton.tsx";

interface ImageItemProps {
  attachment: Attachment;
  onOpen: () => void;
  onRemove: () => void;
}

export const ImageItem = ({ attachment, onOpen, onRemove }: ImageItemProps) => {
  const { t } = useTranslation("attachments");
  const src = attachment.thumbUrl ?? attachment.url ?? "";
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        backgroundColor: "var(--sw-paper-2)",
      }}
    >
      <UnstyledButton
        onClick={onOpen}
        aria-label={attachment.name ?? t("kind.image")}
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <img
          src={src}
          alt={attachment.name ?? ""}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </UnstyledButton>
      <RemoveButton onRemove={onRemove} label={t("remove")} overlay />
    </div>
  );
};
