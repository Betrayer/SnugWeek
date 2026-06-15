import { Box, Group, Radio, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  THEME_GROUPS,
  themeById,
} from "../../../data/themes/registry.ts";
import { useProfileStore } from "../../../state/profileStore.ts";

interface ThumbProps {
  paper: string;
  accent: string;
  ink: string;
}

const ThemeThumb = ({ paper, accent, ink }: ThumbProps) => (
  <Box
    aria-hidden
    style={{
      backgroundColor: paper,
      borderRadius: 8,
      height: 44,
      padding: 6,
      display: "flex",
      gap: 4,
      border: `1px solid color-mix(in srgb, ${ink} 16%, transparent)`,
    }}
  >
    {[0, 1, 2].map((col) => (
      <Box
        key={col}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          paddingTop: 2,
        }}
      >
        <Box
          style={{
            height: 5,
            width: col === 1 ? "75%" : "55%",
            borderRadius: 3,
            backgroundColor:
              col === 1
                ? accent
                : `color-mix(in srgb, ${ink} 32%, transparent)`,
          }}
        />
        <Box
          style={{
            height: 5,
            width: "85%",
            borderRadius: 3,
            backgroundColor: `color-mix(in srgb, ${ink} 20%, transparent)`,
          }}
        />
        <Box
          style={{
            height: 5,
            width: "45%",
            borderRadius: 3,
            backgroundColor: `color-mix(in srgb, ${ink} 20%, transparent)`,
          }}
        />
      </Box>
    ))}
  </Box>
);

interface ThemePickerProps {
  disabled?: boolean;
}

export const ThemePicker = ({ disabled = false }: ThemePickerProps) => {
  const { t } = useTranslation("settings");
  const themeId = useProfileStore((state) => state.themeId);

  return (
    <Radio.Group
      value={themeId}
      onChange={(value) => useProfileStore.getState().setThemeId(value)}
      aria-label={t("theme")}
      aria-disabled={disabled}
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <Stack gap="md">
        {THEME_GROUPS.map((group) => (
          <Stack key={group.id} gap={6}>
            <Text
              ff="var(--sw-font-hand)"
              fz="lg"
              fw={600}
              c="var(--sw-ink-2)"
            >
              {t(`themeGroups.${group.id}`)}
            </Text>
            <Group gap="sm">
              {group.themeIds.map((id) => {
                const spec = themeById(id);
                const active = id === themeId;
                return (
                  <Radio.Card
                    key={id}
                    value={id}
                    radius="md"
                    p="xs"
                    disabled={disabled}
                    style={{
                      width: 104,
                      borderColor: active
                        ? "var(--sw-accent)"
                        : "var(--sw-line)",
                      borderWidth: 2,
                      backgroundColor: "var(--sw-card)",
                      cursor: disabled ? "default" : "pointer",
                    }}
                  >
                    <Stack gap={6}>
                      <ThemeThumb
                        paper={spec.preview.paper}
                        accent={spec.preview.accent}
                        ink={spec.preview.ink}
                      />
                      <Text fz="sm" fw={600} ta="center" c="var(--sw-ink)">
                        {t(`themeNames.${id}`)}
                      </Text>
                    </Stack>
                  </Radio.Card>
                );
              })}
            </Group>
          </Stack>
        ))}
      </Stack>
    </Radio.Group>
  );
};
