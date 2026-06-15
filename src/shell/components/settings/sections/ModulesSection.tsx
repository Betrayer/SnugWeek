import { Divider, Stack, Switch, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "../../../../state/profileStore.ts";
import { HabitSettings } from "../../habits/HabitSettings.tsx";
import { TrackerSettings } from "../../trackers/TrackerSettings.tsx";

export const ModulesSection = () => {
  const { t } = useTranslation(["settings", "trackers", "habits"]);
  const moduleToggles = useProfileStore((state) => state.moduleToggles);

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Switch
          checked={moduleToggles.dayTrackers}
          label={t("settings:moduleDayTrackers")}
          onChange={(event) =>
            useProfileStore
              .getState()
              .setModuleToggle("dayTrackers", event.currentTarget.checked)
          }
        />
        <Switch
          checked={moduleToggles.habits}
          label={t("settings:moduleHabits")}
          onChange={(event) =>
            useProfileStore
              .getState()
              .setModuleToggle("habits", event.currentTarget.checked)
          }
        />
        <Switch
          checked={moduleToggles.weekNote}
          label={t("settings:moduleWeekNote")}
          onChange={(event) =>
            useProfileStore
              .getState()
              .setModuleToggle("weekNote", event.currentTarget.checked)
          }
        />
      </Stack>

      <Divider color="var(--sw-line)" />

      <Stack gap="sm">
        <Title order={4} c="var(--sw-ink)">
          {t("trackers:settings.title")}
        </Title>
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("settings:moduleDayTrackers")}
        </Text>
        <TrackerSettings />
      </Stack>

      <Divider color="var(--sw-line)" />

      <Stack gap="sm">
        <Title order={4} c="var(--sw-ink)">
          {t("habits:settings.title")}
        </Title>
        <HabitSettings />
      </Stack>
    </Stack>
  );
};
