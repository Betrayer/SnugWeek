import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DEFAULT_THEME_ID } from "../data/themes/registry.ts";
import {
  DEFAULT_MODULE_TOGGLES,
  DEFAULT_WEEKEND,
  ensureProfile,
  setColumnMode,
  setModuleToggle,
  setTheme,
  setWeekend,
  subscribeProfile,
} from "../services/repos/profileRepo.ts";
import type { ModuleToggles } from "../services/repos/profileRepo.ts";
import { useSettingsStore } from "./settingsStore.ts";

interface ProfileState {
  loaded: boolean;
  themeId: string;
  weekend: number[];
  columnMode: "cozy" | "equal";
  moduleToggles: ModuleToggles;
  start: (uid: string) => void;
  setThemeId: (themeId: string) => void;
  setWeekend: (weekend: number[]) => void;
  setColumnMode: (columnMode: "cozy" | "equal") => void;
  setModuleToggle: (key: keyof ModuleToggles, value: boolean) => void;
}

let unsubscribe: (() => void) | null = null;
let activeUid: string | null = null;

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      loaded: false,
      themeId: DEFAULT_THEME_ID,
      weekend: DEFAULT_WEEKEND,
      columnMode: "cozy",
      moduleToggles: DEFAULT_MODULE_TOGGLES,
      start: (uid) => {
        if (activeUid === uid && unsubscribe) return;
        if (unsubscribe) unsubscribe();
        activeUid = uid;
        ensureProfile(uid, useSettingsStore.getState().language).catch(
          (error: unknown) => {
            console.error(error);
          },
        );
        unsubscribe = subscribeProfile(uid, (profile) => {
          if (!profile) {
            set({ loaded: true });
            return;
          }
          set({
            loaded: true,
            themeId: profile.themeId,
            weekend: profile.weekend,
            columnMode: profile.columnMode,
            moduleToggles: profile.moduleToggles,
          });
        });
      },
      setThemeId: (themeId) => {
        if (!activeUid) return;
        setTheme(activeUid, themeId);
      },
      setWeekend: (weekend) => {
        if (!activeUid) return;
        setWeekend(activeUid, weekend);
      },
      setColumnMode: (columnMode) => {
        if (!activeUid) return;
        setColumnMode(activeUid, columnMode);
      },
      setModuleToggle: (key, value) => {
        if (!activeUid) return;
        setModuleToggle(activeUid, key, value);
      },
    }),
    { name: "profileStore" },
  ),
);
