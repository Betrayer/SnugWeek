import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { computeHabitStreaks } from "../services/habitStreaks.ts";
import { ORDER_SPACING, orderForBottom } from "../services/ordering.ts";
import {
  applyHabitOrders,
  createHabit,
  restoreHabit,
  setHabitArchived,
  subscribeHabits,
  updateHabit,
} from "../services/repos/habitsRepo.ts";
import type { Habit } from "../services/repos/habitsRepo.ts";

interface HabitsState {
  habits: Habit[];
  streaks: Record<string, number>;
  start: (uid: string) => void;
  add: (name: string, icon: string | null) => void;
  update: (id: string, fields: { name: string; icon: string | null }) => void;
  setArchived: (id: string, archived: boolean) => void;
  restore: (id: string) => void;
  reorder: (orderedIds: string[]) => void;
  refreshStreaks: () => void;
}

let unsubscribe: (() => void) | null = null;
let activeUid: string | null = null;
let streakToken = 0;

export const useHabitsStore = create<HabitsState>()(
  devtools(
    (set, get) => ({
      habits: [],
      streaks: {},
      start: (uid) => {
        if (activeUid === uid && unsubscribe) return;
        if (unsubscribe) unsubscribe();
        activeUid = uid;
        set({ habits: [], streaks: {} });
        unsubscribe = subscribeHabits(uid, (habits) => {
          set({ habits });
          get().refreshStreaks();
        });
      },
      add: (name, icon) => {
        const trimmed = name.trim();
        if (!activeUid || trimmed.length === 0) return;
        const order = orderForBottom(get().habits);
        createHabit(activeUid, trimmed, icon, order);
      },
      update: (id, fields) => {
        const name = fields.name.trim();
        if (!activeUid || name.length === 0) return;
        updateHabit(activeUid, id, { name, icon: fields.icon });
      },
      setArchived: (id, archived) => {
        if (!activeUid) return;
        setHabitArchived(activeUid, id, archived);
      },
      restore: (id) => {
        if (!activeUid) return;
        const active = get().habits.filter((habit) => !habit.archived);
        restoreHabit(activeUid, id, orderForBottom(active));
      },
      reorder: (orderedIds) => {
        if (!activeUid) return;
        applyHabitOrders(
          activeUid,
          orderedIds.map((id, index) => ({ id, order: index * ORDER_SPACING })),
        );
      },
      refreshStreaks: () => {
        if (!activeUid) return;
        const ids = get()
          .habits.filter((habit) => !habit.archived)
          .map((habit) => habit.id);
        const token = (streakToken += 1);
        const uid = activeUid;
        void computeHabitStreaks(uid, ids)
          .then((streaks) => {
            if (token === streakToken) set({ streaks });
          })
          .catch((error: unknown) => {
            console.error(error);
          });
      },
    }),
    { name: "habitsStore" },
  ),
);
