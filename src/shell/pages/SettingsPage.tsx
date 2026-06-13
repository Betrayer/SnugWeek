import { SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, isSupportedLang } from "../../i18n/languages.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";

export const SettingsPage = () => {
  const { t } = useTranslation(["settings", "common"]);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  return (
    <Stack gap="md" maw={480}>
      <Title order={2}>{t("settings:title")}</Title>
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
    </Stack>
  );
};
