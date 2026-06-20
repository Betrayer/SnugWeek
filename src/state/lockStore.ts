import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { lockConfigured } from "../services/lock/lockService.ts";
import { useSettingsStore } from "./settingsStore.ts";

interface LockState {
  locked: boolean;
  lock: () => void;
  unlock: () => void;
}

const shouldStartLocked = (): boolean => {
  try {
    return useSettingsStore.getState().lockEnabled && lockConfigured();
  } catch {
    return false;
  }
};

export const useLockStore = create<LockState>()(
  devtools(
    (set) => ({
      locked: shouldStartLocked(),
      lock: () => {
        if (!useSettingsStore.getState().lockEnabled || !lockConfigured()) {
          return;
        }
        set({ locked: true });
      },
      unlock: () => set({ locked: false }),
    }),
    { name: "lockStore" },
  ),
);
