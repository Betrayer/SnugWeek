import { Button, Stack, TextInput, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { EMOJI_CHOICES, EMOJI_MAX } from "../../../data/emoji.ts";

interface EmojiPickerProps {
  value: string | null;
  onChange: (emoji: string | null) => void;
  onClose?: () => void;
}

const cellStyle = (selected: boolean): CSSProperties => ({
  width: 38,
  height: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--mantine-radius-md)",
  border: `1.5px solid ${selected ? "var(--sw-accent)" : "var(--sw-line)"}`,
  backgroundColor: selected ? "var(--sw-highlight)" : "var(--sw-card)",
  fontSize: 20,
  lineHeight: 1,
});

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: 6,
};

export const EmojiPicker = ({ value, onChange, onClose }: EmojiPickerProps) => {
  const { t } = useTranslation("tasks");
  const [draft, setDraft] = useState(value ?? "");
  const [seen, setSeen] = useState(value);

  if (seen !== value) {
    setSeen(value);
    setDraft(value ?? "");
  }

  const commitDraft = () => {
    const next = draft.trim();
    onChange(next.length > 0 ? next : null);
  };

  const draftKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <Stack gap="sm">
      <div style={gridStyle}>
        {EMOJI_CHOICES.map((emoji) => (
          <UnstyledButton
            key={emoji}
            onClick={() => {
              onChange(emoji);
              onClose?.();
            }}
            aria-label={emoji}
            aria-pressed={value === emoji}
            style={cellStyle(value === emoji)}
          >
            {emoji}
          </UnstyledButton>
        ))}
      </div>
      <TextInput
        value={draft}
        maxLength={EMOJI_MAX}
        placeholder={t("emoji.customPlaceholder")}
        aria-label={t("emoji.custom")}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={commitDraft}
        onKeyDown={draftKey}
      />
      {value !== null && (
        <Button
          variant="subtle"
          c="var(--sw-ink-2)"
          onClick={() => {
            onChange(null);
            onClose?.();
          }}
        >
          {t("emoji.clear")}
        </Button>
      )}
    </Stack>
  );
};
