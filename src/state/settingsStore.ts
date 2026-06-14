import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { changeI18nLanguage } from "../i18n/index.ts";
import { DEFAULT_LANGUAGE, isSupportedLang } from "../i18n/languages.ts";
import type { SupportedLang } from "../i18n/languages.ts";
import { setTimeLocale } from "../services/time.ts";

type TransitionSetting = "fold" | "none" | "curl";

interface PersistedSettings {
  language: SupportedLang;
  reduceMotion: boolean;
  transition: TransitionSetting;
}

interface SettingsState extends PersistedSettings {
  setLanguage: (language: SupportedLang) => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  setTransition: (transition: TransitionSetting) => void;
}

const defaultSettings: PersistedSettings = {
  language: DEFAULT_LANGUAGE,
  reduceMotion: false,
  transition: "curl",
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        ...defaultSettings,
        setLanguage: (language) => {
          set({ language });
          setTimeLocale(language);
          void changeI18nLanguage(language);
        },
        setReduceMotion: (reduceMotion) => set({ reduceMotion }),
        setTransition: (transition) => set({ transition }),
      }),
      {
        name: "snugweek-settings",
        version: 2,
        partialize: (state): PersistedSettings => ({
          language: state.language,
          reduceMotion: state.reduceMotion,
          transition: state.transition,
        }),
        migrate: (persisted) => {
          const stored = persisted as Partial<PersistedSettings> | undefined;
          return {
            ...defaultSettings,
            ...stored,
            transition: defaultSettings.transition,
            language: isSupportedLang(stored?.language)
              ? stored.language
              : DEFAULT_LANGUAGE,
          };
        },
      },
    ),
    { name: "settingsStore" },
  ),
);
