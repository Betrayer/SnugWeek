import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { seedContentFor } from "../../data/defaults.ts";
import { DEFAULT_THEME_ID, themeById } from "../../data/themes/registry.ts";
import {
  DEFAULT_BODY_FONT_ID,
  DEFAULT_FONT_SCOPE,
  DEFAULT_HAND_FONT_ID,
  FONT_SCOPES,
  fontById,
} from "../../data/fonts/registry.ts";
import type { FontScope } from "../../data/fonts/registry.ts";
import type { SupportedLang } from "../../i18n/languages.ts";
import { ORDER_SPACING } from "../ordering.ts";
import { currentWeekId, todayIsoDay } from "../time.ts";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";
import { ALL_WEEK_DAYS, createHabit } from "./habitsRepo.ts";
import { createTask } from "./tasksRepo.ts";
import { MOOD_TRACKER_ID, seedDefaultTrackers } from "./trackersRepo.ts";
import { setTrackerValue } from "./weeksRepo.ts";

const SEED_WINDOW_MS = 5 * 60 * 1000;
const TASKS_LIST_ID = "tasks";

export interface ModuleToggles {
  dayTrackers: boolean;
  habits: boolean;
  weekNote: boolean;
}

export interface AutoTheme {
  light: string;
  dark: string;
}

export type TaskDoneStyle = "strike" | "dim" | "dimStrike" | "fade";

export const TASK_DONE_STYLES: TaskDoneStyle[] = [
  "strike",
  "dim",
  "dimStrike",
  "fade",
];

export const DEFAULT_TASK_DONE_STYLE: TaskDoneStyle = "dimStrike";

export type TaskStrikeStyle = "line" | "pencil" | "cross" | "double";

export const TASK_STRIKE_STYLES: TaskStrikeStyle[] = [
  "line",
  "pencil",
  "cross",
  "double",
];

export const DEFAULT_TASK_STRIKE_STYLE: TaskStrikeStyle = "line";

export const DEFAULT_SHOW_TASK_CHECKBOX = true;

export interface ProfileDoc {
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  themeId: string;
  autoTheme: AutoTheme | null;
  paperTextureEnabled: boolean;
  moduleToggles: ModuleToggles;
  weekend: number[];
  columnMode: "cozy" | "equal";
  taskDoneStyle: TaskDoneStyle;
  taskStrikeStyle: TaskStrikeStyle;
  showTaskCheckbox: boolean;
  fontBodyId: string;
  fontHandId: string;
  fontScope: FontScope;
  statsBackfilledAt: number | null;
  notebookName: string | null;
  coverStyle: string | null;
}

export const NOTEBOOK_NAME_MAX = 40;

export const DEFAULT_MODULE_TOGGLES: ModuleToggles = {
  dayTrackers: true,
  habits: true,
  weekNote: true,
};

export const DEFAULT_WEEKEND: number[] = [6, 7];

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

const normalizeToggles = (value: unknown): ModuleToggles => {
  const source =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  return {
    dayTrackers:
      typeof source.dayTrackers === "boolean" ? source.dayTrackers : true,
    habits: typeof source.habits === "boolean" ? source.habits : true,
    weekNote: typeof source.weekNote === "boolean" ? source.weekNote : true,
  };
};

const DEFAULT_DARK_THEME_ID = "midnight";

const coerceThemeId = (
  id: unknown,
  kind: "light" | "dark",
  fallback: string,
): string => {
  if (typeof id !== "string") return fallback;
  const spec = themeById(id);
  return spec.id === id && spec.kind === kind ? id : fallback;
};

const normalizeTaskDoneStyle = (value: unknown): TaskDoneStyle =>
  TASK_DONE_STYLES.includes(value as TaskDoneStyle)
    ? (value as TaskDoneStyle)
    : DEFAULT_TASK_DONE_STYLE;

const normalizeTaskStrikeStyle = (value: unknown): TaskStrikeStyle => {
  if (value === "single") return "line";
  if (value === "scribble") return "pencil";
  return TASK_STRIKE_STYLES.includes(value as TaskStrikeStyle)
    ? (value as TaskStrikeStyle)
    : DEFAULT_TASK_STRIKE_STYLE;
};

const normalizeBodyFont = (value: unknown): string =>
  typeof value === "string" && fontById(value) !== undefined
    ? value
    : DEFAULT_BODY_FONT_ID;

const normalizeHandFont = (value: unknown): string =>
  typeof value === "string" && fontById(value) !== undefined
    ? value
    : DEFAULT_HAND_FONT_ID;

const normalizeFontScope = (value: unknown): FontScope =>
  FONT_SCOPES.includes(value as FontScope)
    ? (value as FontScope)
    : DEFAULT_FONT_SCOPE;

const normalizeAutoTheme = (value: unknown): AutoTheme | null => {
  if (typeof value !== "object" || value === null) return null;
  const source = value as Record<string, unknown>;
  return {
    light: coerceThemeId(source.light, "light", DEFAULT_THEME_ID),
    dark: coerceThemeId(source.dark, "dark", DEFAULT_DARK_THEME_ID),
  };
};

const normalizeProfile = (data: DocumentData): ProfileDoc => ({
  schemaVersion:
    typeof data.schemaVersion === "number" ? data.schemaVersion : 1,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  themeId: typeof data.themeId === "string" ? data.themeId : DEFAULT_THEME_ID,
  autoTheme: normalizeAutoTheme(data.autoTheme),
  paperTextureEnabled:
    typeof data.paperTextureEnabled === "boolean"
      ? data.paperTextureEnabled
      : false,
  moduleToggles: normalizeToggles(data.moduleToggles),
  weekend: isNumberArray(data.weekend) ? data.weekend : DEFAULT_WEEKEND,
  columnMode: data.columnMode === "equal" ? "equal" : "cozy",
  taskDoneStyle: normalizeTaskDoneStyle(data.taskDoneStyle),
  taskStrikeStyle: normalizeTaskStrikeStyle(data.taskStrikeStyle),
  showTaskCheckbox:
    typeof data.showTaskCheckbox === "boolean"
      ? data.showTaskCheckbox
      : DEFAULT_SHOW_TASK_CHECKBOX,
  fontBodyId: normalizeBodyFont(data.fontBodyId),
  fontHandId: normalizeHandFont(data.fontHandId),
  fontScope: normalizeFontScope(data.fontScope),
  statsBackfilledAt:
    typeof data.statsBackfilledAt === "number" ? data.statsBackfilledAt : null,
  notebookName:
    typeof data.notebookName === "string" && data.notebookName.length > 0
      ? data.notebookName
      : null,
  coverStyle: typeof data.coverStyle === "string" ? data.coverStyle : null,
});

const profileRef = (uid: string) => doc(db, "users", uid);

const seedFirstRun = async (
  uid: string,
  lang: SupportedLang,
): Promise<void> => {
  const ref = profileRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.seeded === true) return;
  const createdAt = typeof data.createdAt === "number" ? data.createdAt : 0;
  if (Date.now() - createdAt > SEED_WINDOW_MS) {
    await updateDoc(ref, { seeded: true }).catch(reportWriteError);
    return;
  }
  const [tasksSnap, habitsSnap] = await Promise.all([
    getDocs(query(collection(db, "users", uid, "tasks"), limit(1))),
    getDocs(query(collection(db, "users", uid, "habits"), limit(1))),
  ]);
  if (!tasksSnap.empty || !habitsSnap.empty) {
    await updateDoc(ref, { seeded: true }).catch(reportWriteError);
    return;
  }
  try {
    const claimed = await runTransaction(db, async (tx) => {
      const fresh = await tx.get(ref);
      if (!fresh.exists() || fresh.data().seeded === true) return false;
      tx.update(ref, { seeded: true });
      return true;
    });
    if (!claimed) return;
  } catch {
    return;
  }
  const content = seedContentFor(lang);
  content.tasks.forEach((title, index) => {
    createTask(uid, {
      title,
      bucket: "list",
      weekId: null,
      day: null,
      listId: TASKS_LIST_ID,
      order: (index + 1) * ORDER_SPACING,
      tagIds: [],
    });
  });
  createHabit(uid, content.habit, content.habitIcon, "rose", ORDER_SPACING, [
    ...ALL_WEEK_DAYS,
  ]);
  setTrackerValue(
    uid,
    currentWeekId(),
    todayIsoDay(),
    MOOD_TRACKER_ID,
    content.mood,
  );
};

export const ensureProfile = async (
  uid: string,
  lang: SupportedLang,
): Promise<void> => {
  const ref = profileRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    if (snap.data().trackersSeeded !== true) {
      await seedDefaultTrackers(uid);
      await updateDoc(ref, { trackersSeeded: true });
    }
    await seedFirstRun(uid, lang);
    return;
  }
  const now = Date.now();
  await setDoc(
    ref,
    {
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      themeId: DEFAULT_THEME_ID,
      moduleToggles: DEFAULT_MODULE_TOGGLES,
      weekend: DEFAULT_WEEKEND,
      columnMode: "cozy",
    },
    { merge: true },
  );
  await seedDefaultTrackers(uid);
  await updateDoc(ref, { trackersSeeded: true });
  await seedFirstRun(uid, lang);
};

export const setTheme = (uid: string, themeId: string): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    themeId,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setAutoTheme = (
  uid: string,
  autoTheme: AutoTheme | null,
): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    autoTheme,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setPaperTexture = (uid: string, enabled: boolean): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    paperTextureEnabled: enabled,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setWeekend = (uid: string, weekend: number[]): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    weekend,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setColumnMode = (
  uid: string,
  columnMode: "cozy" | "equal",
): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    columnMode,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setTaskDoneStyle = (
  uid: string,
  taskDoneStyle: TaskDoneStyle,
): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    taskDoneStyle,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setTaskStrikeStyle = (
  uid: string,
  taskStrikeStyle: TaskStrikeStyle,
): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    taskStrikeStyle,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setShowTaskCheckbox = (
  uid: string,
  showTaskCheckbox: boolean,
): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    showTaskCheckbox,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setFontBody = (uid: string, fontBodyId: string): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    fontBodyId,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setFontHand = (uid: string, fontHandId: string): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    fontHandId,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setFontScope = (uid: string, fontScope: FontScope): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    fontScope,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setNotebookName = (uid: string, name: string | null): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    notebookName: name,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setCoverStyle = (uid: string, style: string | null): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    coverStyle: style,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setModuleToggle = (
  uid: string,
  key: keyof ModuleToggles,
  value: boolean,
): void => {
  notePendingWrite();
  void updateDoc(profileRef(uid), {
    [`moduleToggles.${key}`]: value,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setAccountInfo = (
  uid: string,
  email: string | null,
  displayName: string | null,
): Promise<void> =>
  setDoc(
    profileRef(uid),
    { email, displayName, updatedAt: Date.now() },
    { merge: true },
  );

export const markStatsBackfilled = (uid: string): Promise<void> =>
  updateDoc(profileRef(uid), {
    statsBackfilledAt: Date.now(),
    updatedAt: Date.now(),
  });

export const subscribeProfile = (
  uid: string,
  cb: (profile: ProfileDoc | null) => void,
): (() => void) =>
  onSnapshot(
    profileRef(uid),
    (snap) => {
      cb(snap.exists() ? normalizeProfile(snap.data()) : null);
    },
    reportReadError,
  );
