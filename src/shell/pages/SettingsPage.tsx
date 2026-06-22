import { Stack, Tabs, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { HabitSettings } from "../components/habits/HabitSettings.tsx";
import { SettingsLayout } from "../components/settings/SettingsLayout.tsx";
import type { SettingsSection } from "../components/settings/SettingsLayout.tsx";
import { AboutSection } from "../components/settings/sections/AboutSection.tsx";
import { AccountSection } from "../components/settings/sections/AccountSection.tsx";
import { AppearanceSection } from "../components/settings/sections/AppearanceSection.tsx";
import { DataSection } from "../components/settings/sections/DataSection.tsx";
import { LockSection } from "../components/settings/sections/LockSection.tsx";
import { ModulesSection } from "../components/settings/sections/ModulesSection.tsx";
import { RemindersSection } from "../components/settings/sections/RemindersSection.tsx";
import { RoutinesSection } from "../components/settings/sections/RoutinesSection.tsx";
import { ScheduleSection } from "../components/settings/sections/ScheduleSection.tsx";
import { SoundSection } from "../components/settings/sections/SoundSection.tsx";
import { TagsSection } from "../components/settings/sections/TagsSection.tsx";
import { TrackerSettings } from "../components/trackers/TrackerSettings.tsx";

export const SettingsPage = () => {
  const { t } = useTranslation(["settings", "tags", "routines", "trackers", "habits"]);

  const settingsSections: SettingsSection[] = [
    {
      value: "appearance",
      label: t("settings:appearance"),
      content: <AppearanceSection />,
    },
    { value: "sound", label: t("settings:sound"), content: <SoundSection /> },
    {
      value: "reminders",
      label: t("settings:remindersTitle"),
      content: <RemindersSection />,
    },
    { value: "lock", label: t("settings:lock"), content: <LockSection /> },
    { value: "data", label: t("settings:data"), content: <DataSection /> },
    {
      value: "account",
      label: t("settings:account"),
      content: <AccountSection />,
    },
    { value: "about", label: t("settings:about"), content: <AboutSection /> },
  ];

  const notebookSections: SettingsSection[] = [
    {
      value: "schedule",
      label: t("settings:schedule"),
      content: <ScheduleSection />,
    },
    {
      value: "modules",
      label: t("settings:modules"),
      content: <ModulesSection />,
    },
    {
      value: "trackers",
      label: t("trackers:settings.title"),
      content: <TrackerSettings />,
    },
    {
      value: "habits",
      label: t("habits:settings.title"),
      content: <HabitSettings />,
    },
    { value: "tags", label: t("tags:settingsTab"), content: <TagsSection /> },
    {
      value: "routines",
      label: t("routines:settingsTab"),
      content: <RoutinesSection />,
    },
  ];

  return (
    <Stack gap="xl" pb="xl">
      <Title order={2} c="var(--sw-ink)">
        {t("settings:title")}
      </Title>
      <Tabs
        defaultValue="settings"
        color="var(--sw-accent)"
        styles={{
          list: { borderBottom: "1px solid var(--sw-line)" },
          tab: { fontWeight: 700, color: "var(--sw-ink-2)" },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="settings">{t("settings:tabs.settings")}</Tabs.Tab>
          <Tabs.Tab value="notebook">{t("settings:tabs.notebook")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="settings" pt="xl">
          <SettingsLayout sections={settingsSections} />
        </Tabs.Panel>
        <Tabs.Panel value="notebook" pt="xl">
          <SettingsLayout sections={notebookSections} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};
