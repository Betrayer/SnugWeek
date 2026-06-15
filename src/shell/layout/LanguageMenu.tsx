import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "../../i18n/languages.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { ActionMenu } from "../components/common/ActionMenu.tsx";

export const LanguageMenu = () => {
  const { t } = useTranslation("common");
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <ActionMenu
      label={t("more")}
      actions={SUPPORTED_LANGS.map((lang) => ({
        key: lang,
        label: t(`languageNames.${lang}`),
        onClick: () => setLanguage(lang),
        rightSection: lang === language ? "✓" : undefined,
      }))}
    />
  );
};
