import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { changeI18nLanguage } from "../i18n/index.ts";
import { DEFAULT_LANGUAGE, isSupportedLang } from "../i18n/languages.ts";
import type { SupportedLang } from "../i18n/languages.ts";
import { setTimeLocale } from "../services/time.ts";

type TransitionSetting = "fold" | "none" | "curl";

type LockMethod = "pin" | "passkey";

export type CheerLevel = "off" | "subtle" | "full";

export type MonthView = "calendar" | "tracker";

interface PersistedSettings {
  language: SupportedLang;
  reduceMotion: boolean;
  transition: TransitionSetting;
  soundEnabled: boolean;
  soundVolume: number;
  remindersEnabled: boolean;
  defaultReminderOffsetMin: number;
  lockEnabled: boolean;
  lockMethod: LockMethod | null;
  lockAfterMin: number;
  tourSeen: boolean;
  cheerLevel: CheerLevel;
  monthView: MonthView;
}

interface SettingsState extends PersistedSettings {
  setLanguage: (language: SupportedLang) => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  setTransition: (transition: TransitionSetting) => void;
  setSoundEnabled: (soundEnabled: boolean) => void;
  setSoundVolume: (soundVolume: number) => void;
  setRemindersEnabled: (remindersEnabled: boolean) => void;
  setDefaultReminderOffsetMin: (defaultReminderOffsetMin: number) => void;
  setLockEnabled: (lockEnabled: boolean) => void;
  setLockMethod: (lockMethod: LockMethod | null) => void;
  setLockAfterMin: (lockAfterMin: number) => void;
  setTourSeen: (tourSeen: boolean) => void;
  setCheerLevel: (cheerLevel: CheerLevel) => void;
  setMonthView: (monthView: MonthView) => void;
}

const defaultSettings: PersistedSettings = {
  language: DEFAULT_LANGUAGE,
  reduceMotion: false,
  transition: "curl",
  soundEnabled: true,
  soundVolume: 0.6,
  remindersEnabled: true,
  defaultReminderOffsetMin: 10,
  lockEnabled: false,
  lockMethod: null,
  lockAfterMin: 5,
  tourSeen: false,
  cheerLevel: "subtle",
  monthView: "calendar",
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
        setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
        setSoundVolume: (soundVolume) => set({ soundVolume }),
        setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),
        setDefaultReminderOffsetMin: (defaultReminderOffsetMin) =>
          set({ defaultReminderOffsetMin }),
        setLockEnabled: (lockEnabled) => set({ lockEnabled }),
        setLockMethod: (lockMethod) => set({ lockMethod }),
        setLockAfterMin: (lockAfterMin) => set({ lockAfterMin }),
        setTourSeen: (tourSeen) => set({ tourSeen }),
        setCheerLevel: (cheerLevel) => set({ cheerLevel }),
        setMonthView: (monthView) => set({ monthView }),
      }),
      {
        name: "snugweek-settings",
        version: 8,
        partialize: (state): PersistedSettings => ({
          language: state.language,
          reduceMotion: state.reduceMotion,
          transition: state.transition,
          soundEnabled: state.soundEnabled,
          soundVolume: state.soundVolume,
          remindersEnabled: state.remindersEnabled,
          defaultReminderOffsetMin: state.defaultReminderOffsetMin,
          lockEnabled: state.lockEnabled,
          lockMethod: state.lockMethod,
          lockAfterMin: state.lockAfterMin,
          tourSeen: state.tourSeen,
          cheerLevel: state.cheerLevel,
          monthView: state.monthView,
        }),
        migrate: (persisted, version) => {
          const stored = persisted as Partial<PersistedSettings> | undefined;
          return {
            ...defaultSettings,
            ...stored,
            transition: defaultSettings.transition,
            language: isSupportedLang(stored?.language)
              ? stored.language
              : DEFAULT_LANGUAGE,
            tourSeen: version < 6 ? true : (stored?.tourSeen ?? false),
          };
        },
      },
    ),
    { name: "settingsStore" },
  ),
);
