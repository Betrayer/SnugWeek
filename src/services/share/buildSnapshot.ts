import type { Habit } from "../repos/habitsRepo.ts";
import type { List } from "../repos/listsRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import type { Tracker } from "../repos/trackersRepo.ts";
import type { TrackerValue, WeekDoc } from "../repos/weeksRepo.ts";
import { weekDays, weekTitle } from "../time.ts";
import type {
  ShareInclude,
  ShareSnapshot,
  WeekViewDay,
  WeekViewHabit,
  WeekViewList,
  WeekViewTask,
  WeekViewTracker,
} from "./shareTypes.ts";

export interface SnapshotInput {
  weekId: string;
  language: string;
  week: WeekDoc | null;
  tasksByDay: Record<number, Task[]>;
  lists: List[];
  tasksByList: Record<string, Task[]>;
  trackers: Tracker[];
  habits: Habit[];
  weekend: number[];
  include: ShareInclude;
}

const toViewTask = (task: Task): WeekViewTask => ({
  id: task.id,
  title: task.title,
  done: task.status === "done",
  time: task.time,
});

export interface BuiltSnapshot {
  weekTitle: string;
  snapshot: ShareSnapshot;
}

export const buildSnapshot = (input: SnapshotInput): BuiltSnapshot => {
  const { weekId, language, week, tasksByDay, trackers, habits, weekend, include } =
    input;
  const daysOff = week?.daysOff ?? weekend;

  const days: WeekViewDay[] = weekDays(weekId, language).map((day) => ({
    iso: day.iso,
    label: day.label,
    isOff: daysOff.includes(day.iso),
    tasks: include.tasks ? (tasksByDay[day.iso] ?? []).map(toViewTask) : [],
    note: include.note ? (week?.dayNotes[String(day.iso)] ?? "") : "",
  }));

  const lists: WeekViewList[] = include.lists
    ? input.lists
        .map((list) => ({
          id: list.id,
          name: list.name,
          kind: list.kind,
          emoji: list.emoji,
          tasks: (input.tasksByList[list.id] ?? []).map(toViewTask),
        }))
        .filter((list) => list.tasks.length > 0)
    : [];

  const enabledTrackers: WeekViewTracker[] = include.trackers
    ? trackers
        .filter((tracker) => tracker.enabled)
        .map((tracker) => ({
          id: tracker.id,
          name: tracker.name,
          type: tracker.type,
          icon: tracker.icon,
        }))
    : [];
  const trackerIds = new Set(enabledTrackers.map((tracker) => tracker.id));

  const trackerValues: Record<string, Record<string, TrackerValue>> = {};
  if (include.trackers) {
    for (const [day, byTracker] of Object.entries(week?.trackerValues ?? {})) {
      const dayValues: Record<string, TrackerValue> = {};
      for (const [trackerId, value] of Object.entries(byTracker)) {
        if (trackerIds.has(trackerId)) dayValues[trackerId] = value;
      }
      if (Object.keys(dayValues).length > 0) trackerValues[day] = dayValues;
    }
  }

  const activeHabits: WeekViewHabit[] = include.habits
    ? habits
        .filter((habit) => !habit.archived)
        .map((habit) => ({ id: habit.id, name: habit.name, icon: habit.icon }))
    : [];
  const habitIds = new Set(activeHabits.map((habit) => habit.id));

  const habitChecks: Record<string, Record<string, boolean>> = {};
  if (include.habits) {
    for (const [habitId, byDay] of Object.entries(week?.habitChecks ?? {})) {
      if (!habitIds.has(habitId)) continue;
      const checks: Record<string, boolean> = {};
      for (const [day, value] of Object.entries(byDay)) checks[day] = value === true;
      habitChecks[habitId] = checks;
    }
  }

  return {
    weekTitle: weekTitle(weekId),
    snapshot: {
      days,
      weekNote: include.note ? (week?.note ?? "") : "",
      trackers: enabledTrackers,
      trackerValues,
      habits: activeHabits,
      habitChecks,
      decorations: include.decorations ? (week?.decorations ?? []) : [],
      lists,
    },
  };
};
