import { Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import {
  ICON_KEYS,
  TRACKER_EMOJIS,
  emojiMatchesQuery,
  iconMatchesQuery,
} from "../../../data/icons.ts";
import { TrackerIcon } from "./TrackerIcon.tsx";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  allowClear?: boolean;
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

export const IconPicker = ({ value, onChange, allowClear }: IconPickerProps) => {
  const { t } = useTranslation("trackers");
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const icons = ICON_KEYS.filter((key) => iconMatchesQuery(key, trimmed));
  const emojis = TRACKER_EMOJIS.filter((emoji) =>
    emojiMatchesQuery(emoji, trimmed),
  );
  const empty = icons.length === 0 && emojis.length === 0;

  return (
    <Stack gap="xs">
      <Text fz="sm" fw={600} c="var(--sw-ink-2)">
        {t("settings.icon")}
      </Text>
      <TextInput
        size="xs"
        value={query}
        placeholder={t("settings.iconSearch")}
        aria-label={t("settings.iconSearch")}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />
      {empty ? (
        <Text fz="xs" c="var(--sw-ink-3)" py={4}>
          {t("settings.iconNoMatch")}
        </Text>
      ) : (
        <>
          {icons.length > 0 && (
            <div style={gridStyle}>
              {allowClear && trimmed.length === 0 && (
                <UnstyledButton
                  onClick={() => onChange("")}
                  aria-label={t("settings.iconNone")}
                  aria-pressed={value === ""}
                  style={{
                    ...cellStyle(value === ""),
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--sw-ink-3)",
                  }}
                >
                  {t("settings.iconNoneShort")}
                </UnstyledButton>
              )}
              {icons.map((key) => (
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
          )}
          {emojis.length > 0 && (
            <div style={gridStyle}>
              {emojis.map((emoji) => (
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
          )}
        </>
      )}
    </Stack>
  );
};
