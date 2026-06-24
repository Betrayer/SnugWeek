import { Stack, Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "../../../../state/profileStore.ts";

export const ModulesSection = () => {
  const { t } = useTranslation("settings");
  const moduleToggles = useProfileStore((state) => state.moduleToggles);

  return (
    <Stack gap="sm">
      <Switch
        checked={moduleToggles.dayTrackers}
        label={t("moduleDayTrackers")}
        onChange={(event) =>
          useProfileStore
            .getState()
            .setModuleToggle("dayTrackers", event.currentTarget.checked)
        }
      />
      <Switch
        checked={moduleToggles.habits}
        label={t("moduleHabits")}
        onChange={(event) =>
          useProfileStore
            .getState()
            .setModuleToggle("habits", event.currentTarget.checked)
        }
      />
      <Switch
        checked={moduleToggles.weekNote}
        label={t("moduleWeekNote")}
        onChange={(event) =>
          useProfileStore
            .getState()
            .setModuleToggle("weekNote", event.currentTarget.checked)
        }
      />
    </Stack>
  );
};
