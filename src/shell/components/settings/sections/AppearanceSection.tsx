import {
  Box,
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
import {
  BODY_FONTS,
  FONT_SCOPES,
  HAND_FONTS,
} from "../../../../data/fonts/registry.ts";
import { SUPPORTED_LANGS, isSupportedLang } from "../../../../i18n/languages.ts";
import {
  NOTEBOOK_NAME_MAX,
  TASK_DONE_STYLES,
  TASK_STRIKE_STYLES,
} from "../../../../services/repos/profileRepo.ts";
import { useProfileStore } from "../../../../state/profileStore.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";
import { CoverPicker } from "../CoverPicker.tsx";
import { ThemePicker } from "../ThemePicker.tsx";

const fontStackById = (id: string): string =>
  [...BODY_FONTS, ...HAND_FONTS].find((font) => font.id === id)?.stack ??
  "inherit";

export const AppearanceSection = () => {
  const { t } = useTranslation(["settings", "common"]);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const transition = useSettingsStore((state) => state.transition);
  const setTransition = useSettingsStore((state) => state.setTransition);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const setReduceMotion = useSettingsStore((state) => state.setReduceMotion);
  const cheerLevel = useSettingsStore((state) => state.cheerLevel);
  const setCheerLevel = useSettingsStore((state) => state.setCheerLevel);
  const themeId = useProfileStore((state) => state.themeId);
  const autoTheme = useProfileStore((state) => state.autoTheme);
  const setAutoTheme = useProfileStore((state) => state.setAutoTheme);
  const paperTextureEnabled = useProfileStore(
    (state) => state.paperTextureEnabled,
  );
  const setPaperTextureEnabled = useProfileStore(
    (state) => state.setPaperTextureEnabled,
  );
  const taskDoneStyle = useProfileStore((state) => state.taskDoneStyle);
  const setTaskDoneStyle = useProfileStore((state) => state.setTaskDoneStyle);
  const taskStrikeStyle = useProfileStore((state) => state.taskStrikeStyle);
  const setTaskStrikeStyle = useProfileStore(
    (state) => state.setTaskStrikeStyle,
  );
  const fontBodyId = useProfileStore((state) => state.fontBodyId);
  const setFontBodyId = useProfileStore((state) => state.setFontBodyId);
  const fontHandId = useProfileStore((state) => state.fontHandId);
  const setFontHandId = useProfileStore((state) => state.setFontHandId);
  const fontScope = useProfileStore((state) => state.fontScope);
  const setFontScope = useProfileStore((state) => state.setFontScope);
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
        <Text fw={600}>{t("settings:fonts")}</Text>
        <Group gap="md" grow align="flex-start">
          <Select
            label={t("settings:fontBody")}
            data={BODY_FONTS.map((font) => ({
              value: font.id,
              label: font.name,
            }))}
            value={fontBodyId}
            onChange={(value) => value && setFontBodyId(value)}
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
            renderOption={({ option }) => (
              <span style={{ fontFamily: fontStackById(option.value) }}>
                {option.label}
              </span>
            )}
          />
          <Select
            label={t("settings:fontHand")}
            data={HAND_FONTS.map((font) => ({
              value: font.id,
              label: font.name,
            }))}
            value={fontHandId}
            onChange={(value) => value && setFontHandId(value)}
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
            renderOption={({ option }) => (
              <span style={{ fontFamily: fontStackById(option.value) }}>
                {option.label}
              </span>
            )}
          />
        </Group>
        <Text fz="sm" fw={600} c="var(--sw-ink-2)">
          {t("settings:fontScope")}
        </Text>
        <SegmentedControl
          value={fontScope}
          onChange={(value) => {
            if (
              value === "all" ||
              value === "exceptTasks" ||
              value === "onlyTasks"
            )
              setFontScope(value);
          }}
          data={FONT_SCOPES.map((scope) => ({
            value: scope,
            label: t(`settings:fontScopes.${scope}`),
          }))}
        />
        <Box
          p="sm"
          style={{
            border: "1px solid var(--sw-line)",
            borderRadius: "var(--mantine-radius-md)",
            backgroundColor: "var(--sw-card)",
          }}
        >
          <Text ff="var(--sw-font-hand)" fz={24} c="var(--sw-ink-2)" lh={1.1}>
            {notebookName ?? "SnugWeek"}
          </Text>
          <Text ff="var(--sw-font-body)" c="var(--sw-ink)" mt={6}>
            {t("settings:fontPreviewBody")}
          </Text>
          <Text ff="var(--sw-font-tasks)" c="var(--sw-ink-2)" fz="sm" mt={2}>
            {t("settings:fontPreviewTask")}
          </Text>
        </Box>
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
        <Text fw={600}>{t("settings:cheers")}</Text>
        <SegmentedControl
          value={cheerLevel}
          onChange={(value) => {
            if (value === "off" || value === "subtle" || value === "full")
              setCheerLevel(value);
          }}
          data={[
            { value: "off", label: t("settings:cheerLevels.off") },
            { value: "subtle", label: t("settings:cheerLevels.subtle") },
            { value: "full", label: t("settings:cheerLevels.full") },
          ]}
        />
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("settings:cheersHint")}
        </Text>
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
      <Stack gap="xs">
        <Text fw={600}>{t("settings:taskDoneStyle")}</Text>
        <Select
          data={TASK_DONE_STYLES.map((style) => ({
            value: style,
            label: t(`settings:taskDoneStyles.${style}`),
          }))}
          value={taskDoneStyle}
          onChange={(value) => {
            const next = TASK_DONE_STYLES.find((style) => style === value);
            if (next) setTaskDoneStyle(next);
          }}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />
        {(taskDoneStyle === "strike" || taskDoneStyle === "dimStrike") && (
          <>
            <Text fz="sm" fw={600} c="var(--sw-ink-2)">
              {t("settings:taskStrikeStyle")}
            </Text>
            <SegmentedControl
              value={taskStrikeStyle}
              onChange={(value) => {
                if (
                  value === "single" ||
                  value === "scribble" ||
                  value === "double"
                )
                  setTaskStrikeStyle(value);
              }}
              data={TASK_STRIKE_STYLES.map((style) => ({
                value: style,
                label: t(`settings:taskStrikeStyles.${style}`),
              }))}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};
