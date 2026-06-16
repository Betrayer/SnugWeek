import { Anchor, Group, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../../services/repos/attachmentsRepo.ts";
import { hostnameOf } from "../format.ts";
import { LinkGlyph } from "../icons.tsx";
import { RemoveButton } from "../RemoveButton.tsx";

interface LinkItemProps {
  attachment: Attachment;
  onRemove: () => void;
}

export const LinkItem = ({ attachment, onRemove }: LinkItemProps) => {
  const { t } = useTranslation("attachments");
  const [iconFailed, setIconFailed] = useState(false);
  const href = attachment.href ?? "";
  const host = hostnameOf(href);
  const title = attachment.title && attachment.title.length > 0 ? attachment.title : host;

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
      <Anchor
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        underline="never"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 24,
            height: 24,
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sw-ink-3)",
          }}
        >
          {attachment.previewImage && !iconFailed ? (
            <img
              src={attachment.previewImage}
              alt=""
              width={18}
              height={18}
              onError={() => setIconFailed(true)}
              style={{ borderRadius: 4 }}
            />
          ) : (
            <LinkGlyph size={18} />
          )}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <Text fz="sm" fw={600} c="var(--sw-ink)" truncate>
            {title}
          </Text>
          <Text fz="xs" c="var(--sw-ink-3)" truncate>
            {host}
          </Text>
        </span>
      </Anchor>
      <RemoveButton onRemove={onRemove} label={t("remove")} />
    </Group>
  );
};
