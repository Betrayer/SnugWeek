import { SegmentedControl, Stack, Switch, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, isSupportedLang } from "../../../../i18n/languages.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";
import { ComingSoon } from "../../common/ComingSoon.tsx";
import { ThemePicker } from "../ThemePicker.tsx";

export const AppearanceSection = () => {
  const { t } = useTranslation(["settings", "common"]);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const transition = useSettingsStore((state) => state.transition);
  const setTransition = useSettingsStore((state) => state.setTransition);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const setReduceMotion = useSettingsStore((state) => state.setReduceMotion);

  return (
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
      <Stack gap="xs">
        <Text fw={600}>{t("settings:paperTexture")}</Text>
        <ComingSoon label={t("settings:paperTextureHint")} />
      </Stack>
    </Stack>
  );
};
