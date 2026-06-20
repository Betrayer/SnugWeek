import { Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
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

export const SettingsPage = () => {
  const { t } = useTranslation(["settings", "tags", "routines"]);

  const sections: SettingsSection[] = [
    {
      value: "appearance",
      label: t("appearance"),
      content: <AppearanceSection />,
    },
    { value: "modules", label: t("modules"), content: <ModulesSection /> },
    { value: "tags", label: t("tags:settingsTab"), content: <TagsSection /> },
    {
      value: "routines",
      label: t("routines:settingsTab"),
      content: <RoutinesSection />,
    },
    { value: "schedule", label: t("schedule"), content: <ScheduleSection /> },
    { value: "sound", label: t("sound"), content: <SoundSection /> },
    {
      value: "reminders",
      label: t("remindersTitle"),
      content: <RemindersSection />,
    },
    { value: "lock", label: t("lock"), content: <LockSection /> },
    { value: "data", label: t("data"), content: <DataSection /> },
    { value: "account", label: t("account"), content: <AccountSection /> },
    { value: "about", label: t("about"), content: <AboutSection /> },
  ];

  return (
    <Stack gap="xl" maw={760} pb="xl">
      <Title order={2} c="var(--sw-ink)">
        {t("title")}
      </Title>
      <SettingsLayout sections={sections} />
    </Stack>
  );
};
