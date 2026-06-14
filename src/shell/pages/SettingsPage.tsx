import {
  Button,
  Chip,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, isSupportedLang } from "../../i18n/languages.ts";
import { isoDateKeyOf, weekdayInitials } from "../../services/time.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { useStatsStore } from "../../state/statsStore.ts";
import { HabitSettings } from "../components/habits/HabitSettings.tsx";
import { ThemePicker } from "../components/settings/ThemePicker.tsx";
import { TrackerSettings } from "../components/trackers/TrackerSettings.tsx";

export const SettingsPage = () => {
  const { t } = useTranslation(["settings", "common", "trackers", "habits"]);
  const uid = useAuthStore((state) => state.uid);
  const statsBackfilledAt = useProfileStore((state) => state.statsBackfilledAt);
  const [backfilling, setBackfilling] = useState(false);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const transition = useSettingsStore((state) => state.transition);
  const setTransition = useSettingsStore((state) => state.setTransition);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const setReduceMotion = useSettingsStore((state) => state.setReduceMotion);
  const weekend = useProfileStore((state) => state.weekend);
  const columnMode = useProfileStore((state) => state.columnMode);
  const moduleToggles = useProfileStore((state) => state.moduleToggles);

  const initials = useMemo(() => weekdayInitials(language), [language]);

  const runBackfill = () => {
    if (!uid || backfilling) return;
    setBackfilling(true);
    void useStatsStore
      .getState()
      .backfill(uid)
      .then(() => {
        notifications.show({ message: t("settings:backfillDone") });
      })
      .catch((error: unknown) => {
        console.error(error);
        notifications.show({
          message: t("settings:backfillError"),
          withBorder: true,
          styles: { root: { borderColor: "var(--sw-danger)" } },
        });
      })
      .finally(() => {
        setBackfilling(false);
      });
  };

  return (
    <Stack gap="xl" maw={560} pb="xl">
      <Title order={2} c="var(--sw-ink)">
        {t("settings:title")}
      </Title>

      <Stack gap="lg">
        <Stack gap="xs">
          <Text fw={600}>{t("settings:theme")}</Text>
          <ThemePicker />
        </Stack>
        <Stack gap="xs">
          <Text fw={600}>{t("settings:language")}</Text>
          <SegmentedControl
            value={language}
            onChange={(value) => {
              if (isSupportedLang(value)) setLanguage(value);
            }}
            data={SUPPORTED_LANGS.map((lang) => ({
              value: lang,
              label: t(`common:languageNames.${lang}`),
            }))}
          />
        </Stack>
        <Stack gap="xs">
          <Text fw={600}>{t("settings:animation")}</Text>
          <SegmentedControl
            value={transition}
            onChange={(value) => {
              if (value === "fold" || value === "curl" || value === "none")
                setTransition(value);
            }}
            data={[
              { value: "fold", label: t("settings:transitionFold") },
              { value: "curl", label: t("settings:transitionCurl") },
              { value: "none", label: t("settings:transitionNone") },
            ]}
          />
          <Switch
            checked={reduceMotion}
            onChange={(event) => setReduceMotion(event.currentTarget.checked)}
            label={t("settings:reduceMotion")}
          />
        </Stack>
      </Stack>

      <Divider color="var(--sw-line)" />

      <Stack gap="md">
        <Title order={3} c="var(--sw-ink)">
          {t("settings:schedule")}
        </Title>
        <Stack gap="xs">
          <Text fw={600}>{t("settings:weekend")}</Text>
          <Chip.Group
            multiple
            value={weekend.map(String)}
            onChange={(value) =>
              useProfileStore
                .getState()
                .setWeekend(value.map(Number).sort((a, b) => a - b))
            }
          >
            <Group gap={6} wrap="nowrap">
              {initials.map((initial, index) => (
                <Chip key={index} value={String(index + 1)} size="sm">
                  {initial}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>
        <Stack gap="xs">
          <Text fw={600}>{t("settings:columnMode")}</Text>
          <SegmentedControl
            value={columnMode}
            onChange={(value) => {
              if (value === "cozy" || value === "equal")
                useProfileStore.getState().setColumnMode(value);
            }}
            data={[
              { value: "cozy", label: t("settings:columnCozy") },
              { value: "equal", label: t("settings:columnEqual") },
            ]}
          />
        </Stack>
      </Stack>

      <Divider color="var(--sw-line)" />

      <Stack gap="md">
        <Title order={3} c="var(--sw-ink)">
          {t("settings:modules")}
        </Title>
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
        <Title order={3} c="var(--sw-ink)">
          {t("trackers:settings.title")}
        </Title>
        <TrackerSettings />
      </Stack>

      <Divider color="var(--sw-line)" />

      <Stack gap="sm">
        <Title order={3} c="var(--sw-ink)">
          {t("habits:settings.title")}
        </Title>
        <HabitSettings />
      </Stack>

      <Divider color="var(--sw-line)" />

      <Stack gap="xs">
        <Title order={3} c="var(--sw-ink-3)">
          {t("settings:dev")}
        </Title>
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("settings:backfillHint")}
        </Text>
        <Group>
          <Button
            variant="light"
            loading={backfilling}
            onClick={runBackfill}
          >
            {t("settings:backfill")}
          </Button>
        </Group>
        <Text fz="xs" c="var(--sw-ink-3)">
          {statsBackfilledAt
            ? t("settings:backfillAt", {
                date: isoDateKeyOf(statsBackfilledAt),
              })
            : t("settings:backfillNever")}
        </Text>
      </Stack>
    </Stack>
  );
};
