import { Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SettingsLayout } from "../components/settings/SettingsLayout.tsx";
import type { SettingsSection } from "../components/settings/SettingsLayout.tsx";
import { AboutSection } from "../components/settings/sections/AboutSection.tsx";
import { AccountSection } from "../components/settings/sections/AccountSection.tsx";
import { AppearanceSection } from "../components/settings/sections/AppearanceSection.tsx";
import { ModulesSection } from "../components/settings/sections/ModulesSection.tsx";
import { RemindersSection } from "../components/settings/sections/RemindersSection.tsx";
import { ScheduleSection } from "../components/settings/sections/ScheduleSection.tsx";
import { SoundSection } from "../components/settings/sections/SoundSection.tsx";

export const SettingsPage = () => {
  const { t } = useTranslation("settings");

  const sections: SettingsSection[] = [
    {
      value: "appearance",
      label: t("appearance"),
      content: <AppearanceSection />,
    },
    { value: "modules", label: t("modules"), content: <ModulesSection /> },
    { value: "schedule", label: t("schedule"), content: <ScheduleSection /> },
    { value: "sound", label: t("sound"), content: <SoundSection /> },
    {
      value: "reminders",
      label: t("remindersTitle"),
      content: <RemindersSection />,
    },
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
