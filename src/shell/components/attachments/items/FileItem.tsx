import { Anchor, Group, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../../services/repos/attachmentsRepo.ts";
import { formatBytes } from "../format.ts";
import { DownloadGlyph, FileGlyph } from "../icons.tsx";
import { RemoveButton } from "../RemoveButton.tsx";

interface FileItemProps {
  attachment: Attachment;
  onRemove: () => void;
}

export const FileItem = ({ attachment, onRemove }: FileItemProps) => {
  const { t } = useTranslation("attachments");
  const size = formatBytes(attachment.size);
  return (
    <Group
      gap="sm"
      wrap="nowrap"
      style={{
        padding: "8px 10px",
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: "var(--sw-card)",
        border: "1px solid var(--sw-line)",
      }}
    >
      <span
        aria-hidden
        style={{ color: "var(--sw-ink-3)", lineHeight: 0, flex: "0 0 auto" }}
      >
        <FileGlyph size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text fz="sm" fw={600} c="var(--sw-ink)" truncate>
          {attachment.name ?? t("kind.file")}
        </Text>
        {size && (
          <Text fz="xs" c="var(--sw-ink-3)">
            {size}
          </Text>
        )}
      </div>
      {attachment.url && (
        <Anchor
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          download={attachment.name ?? undefined}
          aria-label={t("download")}
          style={{ color: "var(--sw-ink-2)", display: "inline-flex", flex: "0 0 auto" }}
        >
          <DownloadGlyph size={18} />
        </Anchor>
      )}
      <RemoveButton onRemove={onRemove} label={t("remove")} />
    </Group>
  );
};
