import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DEFAULT_THEME_ID } from "../data/themes/registry.ts";
import {
  DEFAULT_BODY_FONT_ID,
  DEFAULT_FONT_SCOPE,
  DEFAULT_HAND_FONT_ID,
} from "../data/fonts/registry.ts";
import type { FontScope } from "../data/fonts/registry.ts";
import {
  DEFAULT_MODULE_TOGGLES,
  DEFAULT_TASK_DONE_STYLE,
  DEFAULT_TASK_STRIKE_STYLE,
  DEFAULT_WEEKEND,
  ensureProfile,
  setAutoTheme,
  setColumnMode,
  setCoverStyle,
  setFontBody,
  setFontHand,
  setFontScope,
  setModuleToggle,
  setNotebookName,
  setPaperTexture,
  setTaskDoneStyle,
  setTaskStrikeStyle,
  setTheme,
  setWeekend,
  subscribeProfile,
} from "../services/repos/profileRepo.ts";
import type {
  AutoTheme,
  ModuleToggles,
  TaskDoneStyle,
  TaskStrikeStyle,
} from "../services/repos/profileRepo.ts";
import { useSettingsStore } from "./settingsStore.ts";

interface ProfileState {
  loaded: boolean;
  themeId: string;
  autoTheme: AutoTheme | null;
  paperTextureEnabled: boolean;
  weekend: number[];
  columnMode: "cozy" | "equal";
  taskDoneStyle: TaskDoneStyle;
  taskStrikeStyle: TaskStrikeStyle;
  fontBodyId: string;
  fontHandId: string;
  fontScope: FontScope;
  moduleToggles: ModuleToggles;
  statsBackfilledAt: number | null;
  notebookName: string | null;
  coverStyle: string | null;
  start: (uid: string) => void;
  stop: () => void;
  setThemeId: (themeId: string) => void;
  setAutoTheme: (autoTheme: AutoTheme | null) => void;
  setPaperTextureEnabled: (enabled: boolean) => void;
  setWeekend: (weekend: number[]) => void;
  setColumnMode: (columnMode: "cozy" | "equal") => void;
  setTaskDoneStyle: (taskDoneStyle: TaskDoneStyle) => void;
  setTaskStrikeStyle: (taskStrikeStyle: TaskStrikeStyle) => void;
  setFontBodyId: (fontBodyId: string) => void;
  setFontHandId: (fontHandId: string) => void;
  setFontScope: (fontScope: FontScope) => void;
  setModuleToggle: (key: keyof ModuleToggles, value: boolean) => void;
  setNotebookName: (name: string | null) => void;
  setCoverStyle: (style: string | null) => void;
}

let unsubscribe: (() => void) | null = null;
let activeUid: string | null = null;

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      loaded: false,
      themeId: DEFAULT_THEME_ID,
      autoTheme: null,
      paperTextureEnabled: false,
      weekend: DEFAULT_WEEKEND,
      columnMode: "cozy",
      taskDoneStyle: DEFAULT_TASK_DONE_STYLE,
      taskStrikeStyle: DEFAULT_TASK_STRIKE_STYLE,
      fontBodyId: DEFAULT_BODY_FONT_ID,
      fontHandId: DEFAULT_HAND_FONT_ID,
      fontScope: DEFAULT_FONT_SCOPE,
      moduleToggles: DEFAULT_MODULE_TOGGLES,
      statsBackfilledAt: null,
      notebookName: null,
      coverStyle: null,
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
            autoTheme: profile.autoTheme,
            paperTextureEnabled: profile.paperTextureEnabled,
            weekend: profile.weekend,
            columnMode: profile.columnMode,
            taskDoneStyle: profile.taskDoneStyle,
            taskStrikeStyle: profile.taskStrikeStyle,
            fontBodyId: profile.fontBodyId,
            fontHandId: profile.fontHandId,
            fontScope: profile.fontScope,
            moduleToggles: profile.moduleToggles,
            statsBackfilledAt: profile.statsBackfilledAt,
            notebookName: profile.notebookName,
            coverStyle: profile.coverStyle,
          });
        });
      },
      stop: () => {
        if (unsubscribe) unsubscribe();
        unsubscribe = null;
        activeUid = null;
        set({
          loaded: false,
          themeId: DEFAULT_THEME_ID,
          autoTheme: null,
          paperTextureEnabled: false,
          weekend: DEFAULT_WEEKEND,
          columnMode: "cozy",
          taskDoneStyle: DEFAULT_TASK_DONE_STYLE,
          taskStrikeStyle: DEFAULT_TASK_STRIKE_STYLE,
          fontBodyId: DEFAULT_BODY_FONT_ID,
          fontHandId: DEFAULT_HAND_FONT_ID,
          fontScope: DEFAULT_FONT_SCOPE,
          moduleToggles: DEFAULT_MODULE_TOGGLES,
          statsBackfilledAt: null,
          notebookName: null,
          coverStyle: null,
        });
      },
      setThemeId: (themeId) => {
        if (!activeUid) return;
        setTheme(activeUid, themeId);
      },
      setAutoTheme: (autoTheme) => {
        if (!activeUid) return;
        setAutoTheme(activeUid, autoTheme);
      },
      setPaperTextureEnabled: (enabled) => {
        if (!activeUid) return;
        setPaperTexture(activeUid, enabled);
      },
      setWeekend: (weekend) => {
        if (!activeUid) return;
        setWeekend(activeUid, weekend);
      },
      setColumnMode: (columnMode) => {
        if (!activeUid) return;
        setColumnMode(activeUid, columnMode);
      },
      setTaskDoneStyle: (taskDoneStyle) => {
        if (!activeUid) return;
        setTaskDoneStyle(activeUid, taskDoneStyle);
      },
      setTaskStrikeStyle: (taskStrikeStyle) => {
        if (!activeUid) return;
        setTaskStrikeStyle(activeUid, taskStrikeStyle);
      },
      setFontBodyId: (fontBodyId) => {
        if (!activeUid) return;
        setFontBody(activeUid, fontBodyId);
      },
      setFontHandId: (fontHandId) => {
        if (!activeUid) return;
        setFontHand(activeUid, fontHandId);
      },
      setFontScope: (fontScope) => {
        if (!activeUid) return;
        setFontScope(activeUid, fontScope);
      },
      setModuleToggle: (key, value) => {
        if (!activeUid) return;
        setModuleToggle(activeUid, key, value);
      },
      setNotebookName: (name) => {
        if (!activeUid) return;
        setNotebookName(activeUid, name);
      },
      setCoverStyle: (style) => {
        if (!activeUid) return;
        setCoverStyle(activeUid, style);
      },
    }),
    { name: "profileStore" },
  ),
);
