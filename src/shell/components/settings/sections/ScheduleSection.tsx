import { Chip, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { weekdayInitials } from "../../../../services/time.ts";
import { useProfileStore } from "../../../../state/profileStore.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";
import { useIsMobile } from "../../../hooks/useIsMobile.ts";

export const ScheduleSection = () => {
  const { t } = useTranslation("settings");
  const isMobile = useIsMobile();
  const language = useSettingsStore((state) => state.language);
  const weekend = useProfileStore((state) => state.weekend);
  const columnMode = useProfileStore((state) => state.columnMode);
  const initials = useMemo(() => weekdayInitials(language), [language]);

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text fw={600}>{t("weekend")}</Text>
        <Chip.Group
          multiple
          value={weekend.map(String)}
          onChange={(value) =>
            useProfileStore
              .getState()
              .setWeekend(value.map(Number).sort((a, b) => a - b))
          }
        >
          <Group gap={6} wrap="wrap">
            {initials.map((initial, index) => (
              <Chip key={index} value={String(index + 1)} size="sm">
                {initial}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>
      <Stack gap="xs">
        <Text fw={600}>{t("columnMode")}</Text>
        <SegmentedControl
          fullWidth={isMobile}
          orientation={isMobile ? "vertical" : "horizontal"}
          value={columnMode}
          onChange={(value) => {
            if (value === "cozy" || value === "equal")
              useProfileStore.getState().setColumnMode(value);
          }}
          data={[
            { value: "cozy", label: t("columnCozy") },
            { value: "equal", label: t("columnEqual") },
          ]}
        />
      </Stack>
    </Stack>
  );
};
