import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { DEFAULT_THEME_ID } from "../../data/themes/registry.ts";
import { db } from "../firebase.ts";

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
});

const profileRef = (uid: string) => doc(db, "users", uid);

export const ensureProfile = async (uid: string): Promise<void> => {
  const ref = profileRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
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
};

export const subscribeProfile = (
  uid: string,
  cb: (profile: ProfileDoc | null) => void,
): (() => void) =>
  onSnapshot(profileRef(uid), (snap) => {
    cb(snap.exists() ? normalizeProfile(snap.data()) : null);
  });
