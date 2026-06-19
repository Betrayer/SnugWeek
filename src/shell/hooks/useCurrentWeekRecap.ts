import { useEffect, useMemo } from "react";
import {
  ENERGY_TRACKER_ID,
  MOOD_TRACKER_ID,
} from "../../services/repos/trackersRepo.ts";
import { buildWeekRecap } from "../../services/recap/weeklyRecap.ts";
import type { WeekRecap } from "../../services/recap/weeklyRecap.ts";
import { currentWeekId } from "../../services/time.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useHabitsStore } from "../../state/habitsStore.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { useRecapStore } from "../../state/recapStore.ts";
import { useTrackersStore } from "../../state/trackersStore.ts";

export const useCurrentWeekRecap = (): WeekRecap | null => {
  const uid = useAuthStore((state) => state.uid);
  const weekId = currentWeekId();
  const week = useRecapStore((state) => state.week);
  const tasks = useRecapStore((state) => state.tasks);
  const status = useRecapStore((state) => state.status);
  const moduleToggles = useProfileStore((state) => state.moduleToggles);
  const habits = useHabitsStore((state) => state.habits);
  const trackers = useTrackersStore((state) => state.trackers);

  useEffect(() => {
    if (uid) useRecapStore.getState().open(uid, weekId);
  }, [uid, weekId]);

  const moodEnabled =
    moduleToggles.dayTrackers &&
    trackers.some(
      (tracker) => tracker.id === MOOD_TRACKER_ID && tracker.enabled,
    );
  const energyEnabled =
    moduleToggles.dayTrackers &&
    trackers.some(
      (tracker) => tracker.id === ENERGY_TRACKER_ID && tracker.enabled,
    );
  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.archived),
    [habits],
  );

  return useMemo(
    () =>
      status !== "ready"
        ? null
        : buildWeekRecap({
            weekId,
            tasks,
            week,
            habits: activeHabits,
            moodEnabled,
            energyEnabled,
            habitsEnabled: moduleToggles.habits,
          }),
    [
      status,
      weekId,
      tasks,
      week,
      activeHabits,
      moodEnabled,
      energyEnabled,
      moduleToggles.habits,
    ],
  );
};
