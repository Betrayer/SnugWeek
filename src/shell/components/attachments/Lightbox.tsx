import { Group, Modal, Text, UnstyledButton } from "@mantine/core";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../services/repos/attachmentsRepo.ts";
import {
  ChevronLeftGlyph,
  ChevronRightGlyph,
  CloseGlyph,
  PinGlyph,
} from "../icons/glyphs.tsx";

interface LightboxProps {
  images: Attachment[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  onPin?: (attachment: Attachment) => void;
}

const navButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--sw-ink-2)",
  backgroundColor: "var(--sw-card)",
  boxShadow: "var(--sw-shadow)",
} as const;

export const Lightbox = ({
  images,
  index,
  onIndex,
  onClose,
  onPin,
}: LightboxProps) => {
  const { t } = useTranslation("attachments");
  const opened = index >= 0 && index < images.length;
  const current = opened ? images[index] : undefined;
  const count = images.length;

  useEffect(() => {
    if (!opened) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onIndex((index - 1 + count) % count);
      else if (event.key === "ArrowRight") onIndex((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, index, count, onIndex]);

  if (!current) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="auto"
      padding={0}
      radius="lg"
      zIndex={400}
      overlayProps={{ backgroundOpacity: 0.65 }}
      styles={{ content: { backgroundColor: "var(--sw-paper)" } }}
    >
      <Group
        justify="space-between"
        wrap="nowrap"
        px="sm"
        py={8}
        style={{ borderBottom: "1px solid var(--sw-line)" }}
      >
        <Text fz="sm" c="var(--sw-ink-3)" fw={600}>
          {t("lightbox.counter", { index: index + 1, total: count })}
        </Text>
        <Group gap={4} wrap="nowrap">
          {onPin && (
            <UnstyledButton
              onClick={() => onPin(current)}
              aria-label={t("pin")}
              style={{ color: "var(--sw-ink-2)", display: "inline-flex" }}
            >
              <PinGlyph size={20} />
            </UnstyledButton>
          )}
          <UnstyledButton
            onClick={onClose}
            aria-label={t("lightbox.close")}
            style={{ color: "var(--sw-ink-2)", display: "inline-flex" }}
          >
            <CloseGlyph size={20} />
          </UnstyledButton>
        </Group>
      </Group>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
        }}
      >
        <img
          src={current.url ?? current.thumbUrl ?? ""}
          alt={current.name ?? ""}
          style={{
            display: "block",
            maxWidth: "min(86vw, 900px)",
            maxHeight: "78vh",
            borderRadius: "var(--mantine-radius-md)",
            objectFit: "contain",
          }}
        />
        {count > 1 && (
          <>
            <UnstyledButton
              onClick={() => onIndex((index - 1 + count) % count)}
              aria-label={t("lightbox.prev")}
              style={{ ...navButtonStyle, position: "absolute", left: 16 }}
            >
              <ChevronLeftGlyph size={22} />
            </UnstyledButton>
            <UnstyledButton
              onClick={() => onIndex((index + 1) % count)}
              aria-label={t("lightbox.next")}
              style={{ ...navButtonStyle, position: "absolute", right: 16 }}
            >
              <ChevronRightGlyph size={22} />
            </UnstyledButton>
          </>
        )}
      </div>
    </Modal>
  );
};
