import {
  Group,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { THEME_ORDER, themeById } from "../../../../data/themes/registry.ts";
import { SUPPORTED_LANGS, isSupportedLang } from "../../../../i18n/languages.ts";
import { NOTEBOOK_NAME_MAX } from "../../../../services/repos/profileRepo.ts";
import { useProfileStore } from "../../../../state/profileStore.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";
import { CoverPicker } from "../CoverPicker.tsx";
import { ThemePicker } from "../ThemePicker.tsx";

export const AppearanceSection = () => {
  const { t } = useTranslation(["settings", "common"]);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const transition = useSettingsStore((state) => state.transition);
  const setTransition = useSettingsStore((state) => state.setTransition);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const setReduceMotion = useSettingsStore((state) => state.setReduceMotion);
  const themeId = useProfileStore((state) => state.themeId);
  const autoTheme = useProfileStore((state) => state.autoTheme);
  const setAutoTheme = useProfileStore((state) => state.setAutoTheme);
  const paperTextureEnabled = useProfileStore(
    (state) => state.paperTextureEnabled,
  );
  const setPaperTextureEnabled = useProfileStore(
    (state) => state.setPaperTextureEnabled,
  );
  const notebookName = useProfileStore((state) => state.notebookName);
  const [nameDraft, setNameDraft] = useState(notebookName ?? "");
  const [seenName, setSeenName] = useState(notebookName);

  if (seenName !== notebookName) {
    setSeenName(notebookName);
    setNameDraft(notebookName ?? "");
  }

  const commitName = () => {
    const trimmed = nameDraft.trim().slice(0, NOTEBOOK_NAME_MAX);
    const next = trimmed.length > 0 ? trimmed : null;
    if (next !== notebookName) useProfileStore.getState().setNotebookName(next);
  };

  const lightOptions = THEME_ORDER.filter(
    (id) => themeById(id).kind === "light",
  ).map((id) => ({ value: id, label: t(`settings:themeNames.${id}`) }));
  const darkOptions = THEME_ORDER.filter(
    (id) => themeById(id).kind === "dark",
  ).map((id) => ({ value: id, label: t(`settings:themeNames.${id}`) }));

  const toggleAuto = (enabled: boolean) => {
    if (!enabled) {
      setAutoTheme(null);
      return;
    }
    const light = themeById(themeId).kind === "light" ? themeId : "milk";
    setAutoTheme({ light, dark: "midnight" });
  };

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text fw={600}>{t("settings:notebookName")}</Text>
        <TextInput
          value={nameDraft}
          maxLength={NOTEBOOK_NAME_MAX}
          placeholder={t("settings:notebookNamePlaceholder")}
          aria-label={t("settings:notebookName")}
          onChange={(event) => setNameDraft(event.currentTarget.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
      </Stack>
      <Stack gap="xs">
        <Text fw={600}>{t("settings:coverStyle")}</Text>
        <CoverPicker />
      </Stack>
      <Stack gap="xs">
        <Text fw={600}>{t("settings:theme")}</Text>
        <ThemePicker disabled={autoTheme !== null} />
        <Switch
          checked={autoTheme !== null}
          onChange={(event) => toggleAuto(event.currentTarget.checked)}
          label={t("settings:autoTheme")}
          description={t("settings:autoThemeHint")}
        />
        {autoTheme && (
          <Group gap="md" grow align="flex-start">
            <Select
              label={t("settings:autoLight")}
              data={lightOptions}
              value={autoTheme.light}
              onChange={(value) =>
                value && setAutoTheme({ ...autoTheme, light: value })
              }
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
            <Select
              label={t("settings:autoDark")}
              data={darkOptions}
              value={autoTheme.dark}
              onChange={(value) =>
                value && setAutoTheme({ ...autoTheme, dark: value })
              }
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
          </Group>
        )}
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
        <Switch
          checked={paperTextureEnabled}
          onChange={(event) =>
            setPaperTextureEnabled(event.currentTarget.checked)
          }
          label={t("settings:paperTextureHint")}
        />
      </Stack>
    </Stack>
  );
};
