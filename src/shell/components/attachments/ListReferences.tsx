import { Stack, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { AttachmentsArea } from "./AttachmentsArea.tsx";
import { ChevronRightGlyph, PaperclipGlyph } from "../icons/glyphs.tsx";

interface ListReferencesProps {
  listId: string;
  count: number;
}

export const ListReferences = ({ listId, count }: ListReferencesProps) => {
  const { t } = useTranslation("attachments");
  const [open, { toggle }] = useDisclosure(false);

  return (
    <Stack gap={6}>
      <UnstyledButton
        onClick={toggle}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          color: "var(--sw-ink-3)",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <PaperclipGlyph size={13} />
        <span>
          {t("title")}
          {count > 0 ? ` (${count})` : ""}
        </span>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform 150ms ease",
          }}
        >
          <ChevronRightGlyph size={14} />
        </span>
      </UnstyledButton>
      {open && <AttachmentsArea scope="list" listId={listId} />}
    </Stack>
  );
};
