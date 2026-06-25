import { UnstyledButton } from "@mantine/core";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../../services/repos/attachmentsRepo.ts";
import { PinGlyph } from "../../icons/glyphs.tsx";
import { RemoveButton } from "../RemoveButton.tsx";

interface ImageItemProps {
  attachment: Attachment;
  onOpen: () => void;
  onRemove: () => void;
  onPin?: () => void;
}

export const ImageItem = ({
  attachment,
  onOpen,
  onRemove,
  onPin,
}: ImageItemProps) => {
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
      {onPin && (
        <UnstyledButton
          aria-label={t("pin")}
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            onPin();
          }}
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sw-ink-2)",
            backgroundColor: "var(--sw-card)",
            boxShadow: "var(--sw-shadow)",
          }}
        >
          <PinGlyph size={15} />
        </UnstyledButton>
      )}
      <RemoveButton onRemove={onRemove} label={t("remove")} overlay />
    </div>
  );
};
