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
import { DEFAULT_THEME_ID } from "../../data/themes/registry.ts";
import type { SupportedLang } from "../../i18n/languages.ts";
import { ORDER_SPACING } from "../ordering.ts";
import { currentWeekId, todayIsoDay } from "../time.ts";
import { db } from "../firebase.ts";
import { reportWriteError } from "./writeError.ts";
import { createHabit } from "./habitsRepo.ts";
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

export interface ProfileDoc {
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  themeId: string;
  moduleToggles: ModuleToggles;
  weekend: number[];
  columnMode: "cozy" | "equal";
  statsBackfilledAt: number | null;
}

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

const normalizeProfile = (data: DocumentData): ProfileDoc => ({
  schemaVersion:
    typeof data.schemaVersion === "number" ? data.schemaVersion : 1,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  themeId: typeof data.themeId === "string" ? data.themeId : DEFAULT_THEME_ID,
  moduleToggles: normalizeToggles(data.moduleToggles),
  weekend: isNumberArray(data.weekend) ? data.weekend : DEFAULT_WEEKEND,
  columnMode: data.columnMode === "equal" ? "equal" : "cozy",
  statsBackfilledAt:
    typeof data.statsBackfilledAt === "number" ? data.statsBackfilledAt : null,
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
    });
  });
  createHabit(uid, content.habit, content.habitIcon, ORDER_SPACING);
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
  void updateDoc(profileRef(uid), {
    themeId,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setWeekend = (uid: string, weekend: number[]): void => {
  void updateDoc(profileRef(uid), {
    weekend,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setColumnMode = (
  uid: string,
  columnMode: "cozy" | "equal",
): void => {
  void updateDoc(profileRef(uid), {
    columnMode,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setModuleToggle = (
  uid: string,
  key: keyof ModuleToggles,
  value: boolean,
): void => {
  void updateDoc(profileRef(uid), {
    [`moduleToggles.${key}`]: value,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const markStatsBackfilled = (uid: string): Promise<void> =>
  updateDoc(profileRef(uid), {
    statsBackfilledAt: Date.now(),
    updatedAt: Date.now(),
  });

export const subscribeProfile = (
  uid: string,
  cb: (profile: ProfileDoc | null) => void,
): (() => void) =>
  onSnapshot(profileRef(uid), (snap) => {
    cb(snap.exists() ? normalizeProfile(snap.data()) : null);
  });
