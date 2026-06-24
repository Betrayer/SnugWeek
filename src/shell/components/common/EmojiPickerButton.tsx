import { Popover, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { EmojiPicker } from "./EmojiPicker.tsx";

interface EmojiPickerButtonProps {
  value: string | null;
  onChange: (emoji: string | null) => void;
}

const buttonStyle: CSSProperties = {
  width: 40,
  height: 40,
  flex: "0 0 auto",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--sw-line)",
  backgroundColor: "var(--sw-card)",
  fontSize: 22,
  lineHeight: 1,
  color: "var(--sw-ink-3)",
};

export const EmojiPickerButton = ({
  value,
  onChange,
}: EmojiPickerButtonProps) => {
  const { t } = useTranslation("tasks");
  const [opened, setOpened] = useState(false);
  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      radius="md"
      shadow="md"
      withinPortal
    >
      <Popover.Target>
        <UnstyledButton
          onClick={() => setOpened((open) => !open)}
          aria-label={t("emoji.set")}
          style={buttonStyle}
        >
          {value ?? "+"}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown
        p="sm"
        style={{
          backgroundColor: "var(--sw-card)",
          borderColor: "var(--sw-line)",
        }}
      >
        <EmojiPicker
          value={value}
          onChange={onChange}
          onClose={() => setOpened(false)}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
