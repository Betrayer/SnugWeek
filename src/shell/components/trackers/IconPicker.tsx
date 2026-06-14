import { Stack, Text, UnstyledButton } from "@mantine/core";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ICON_KEYS, TRACKER_EMOJIS } from "../../../data/icons.ts";
import { TrackerIcon } from "./TrackerIcon.tsx";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
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
  color: "var(--sw-ink-2)",
  fontSize: 20,
  lineHeight: 1,
});

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: 6,
};

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const { t } = useTranslation("trackers");
  return (
    <Stack gap="xs">
      <Text fz="sm" fw={600} c="var(--sw-ink-2)">
        {t("settings.icon")}
      </Text>
      <div style={gridStyle}>
        {ICON_KEYS.map((key) => (
          <UnstyledButton
            key={key}
            onClick={() => onChange(key)}
            aria-label={key}
            aria-pressed={value === key}
            style={cellStyle(value === key)}
          >
            <TrackerIcon icon={key} size={20} />
          </UnstyledButton>
        ))}
      </div>
      <div style={gridStyle}>
        {TRACKER_EMOJIS.map((emoji) => (
          <UnstyledButton
            key={emoji}
            onClick={() => onChange(emoji)}
            aria-label={emoji}
            aria-pressed={value === emoji}
            style={cellStyle(value === emoji)}
          >
            {emoji}
          </UnstyledButton>
        ))}
      </div>
    </Stack>
  );
};
