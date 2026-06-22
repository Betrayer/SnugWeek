import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { cheerStreak } from "../services/cheer/cheerService.ts";
import { STREAK_MILESTONES } from "../services/cheer/cheerMessages.ts";
import { computeHabitStreaks } from "../services/habitStreaks.ts";
import { ORDER_SPACING, orderForBottom } from "../services/ordering.ts";
import {
  ALL_WEEK_DAYS,
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
  stop: () => void;
  add: (name: string, icon: string | null) => void;
  update: (
    id: string,
    fields: { name: string; icon: string | null; days: number[] },
  ) => void;
  setArchived: (id: string, archived: boolean) => void;
  restore: (id: string) => void;
  reorder: (orderedIds: string[]) => void;
  refreshStreaks: () => void;
  cheerHabitStreak: (habitId: string) => void;
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
      stop: () => {
        if (unsubscribe) unsubscribe();
        unsubscribe = null;
        activeUid = null;
        streakToken += 1;
        set({ habits: [], streaks: {} });
      },
      add: (name, icon) => {
        const trimmed = name.trim();
        if (!activeUid || trimmed.length === 0) return;
        const order = orderForBottom(get().habits);
        createHabit(activeUid, trimmed, icon, order, [...ALL_WEEK_DAYS]);
      },
      update: (id, fields) => {
        const name = fields.name.trim();
        if (!activeUid || name.length === 0 || fields.days.length === 0) return;
        updateHabit(activeUid, id, {
          name,
          icon: fields.icon,
          days: fields.days,
        });
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
        const schedules = get()
          .habits.filter((habit) => !habit.archived)
          .map((habit) => ({ id: habit.id, days: habit.days }));
        const token = (streakToken += 1);
        const uid = activeUid;
        void computeHabitStreaks(uid, schedules)
          .then((streaks) => {
            if (token === streakToken && uid === activeUid) set({ streaks });
          })
          .catch((error: unknown) => {
            console.error(error);
          });
      },
      cheerHabitStreak: (habitId) => {
        if (!activeUid) return;
        const habit = get().habits.find((entry) => entry.id === habitId);
        if (!habit) return;
        const uid = activeUid;
        void computeHabitStreaks(uid, [{ id: habit.id, days: habit.days }])
          .then((streaks) => {
            if (uid !== activeUid) return;
            const streak = streaks[habitId] ?? 0;
            if (!STREAK_MILESTONES.includes(streak)) return;
            cheerStreak(habit.name, streak);
          })
          .catch((error: unknown) => {
            console.error(error);
          });
      },
    }),
    { name: "habitsStore" },
  ),
);
