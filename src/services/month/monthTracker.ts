import { TAG_SWATCHES } from "../../data/tagColors.ts";
import type { Habit } from "../repos/habitsRepo.ts";
import type { Routine } from "../repos/routinesRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import { isoDateKey } from "../time.ts";

export type TrackerCellState = "full" | "light";

export interface TrackerRow {
  id: string;
  label: string;
  icon: string | null;
  color: string;
  cells: Record<string, TrackerCellState>;
}

export type TrackerSectionId = "habits" | "routines" | "tasks";

export interface TrackerSection {
  id: TrackerSectionId;
  rows: TrackerRow[];
}

export interface MonthTrackerInput {
  monthId: string;
  habits: Habit[];
  routines: Routine[];
  tasks: Task[];
  habitChecksByDate: Record<string, string[]>;
  showHabits: boolean;
}

const FALLBACK_COLOR = "#d28aa0";

const colorAt = (index: number): string =>
  TAG_SWATCHES[index % TAG_SWATCHES.length]?.value ?? FALLBACK_COLOR;

interface DayTask {
  task: Task;
  dateKey: string;
}

const monthDayTasks = (tasks: Task[], monthId: string): DayTask[] => {
  const result: DayTask[] = [];
  for (const task of tasks) {
    if (task.bucket !== "day" || task.weekId === null || task.day === null) {
      continue;
    }
    const dateKey = isoDateKey(task.weekId, task.day);
    if (!dateKey.startsWith(monthId)) continue;
    result.push({ task, dateKey });
  }
  return result;
};

const buildHabitRows = (
  habits: Habit[],
  habitChecksByDate: Record<string, string[]>,
  monthId: string,
): TrackerRow[] =>
  habits
    .filter((habit) => !habit.archived)
    .map((habit) => {
      const cells: Record<string, TrackerCellState> = {};
      for (const [dateKey, ids] of Object.entries(habitChecksByDate)) {
        if (!dateKey.startsWith(monthId)) continue;
        if (ids.includes(habit.id)) cells[dateKey] = "full";
      }
      return {
        id: `habit-${habit.id}`,
        label: habit.name,
        icon: habit.icon,
        color: "",
        cells,
      };
    });

const buildRoutineRows = (
  dayTasks: DayTask[],
  routines: Routine[],
): TrackerRow[] => {
  const cellsByRoutine = new Map<string, Record<string, TrackerCellState>>();
  const labelByRoutine = new Map<string, string>();
  const seen: string[] = [];
  for (const { task, dateKey } of dayTasks) {
    if (task.routineId === null) continue;
    let cells = cellsByRoutine.get(task.routineId);
    if (!cells) {
      cells = {};
      cellsByRoutine.set(task.routineId, cells);
      labelByRoutine.set(task.routineId, task.title);
      seen.push(task.routineId);
    }
    if (task.status === "done") cells[dateKey] = "full";
    else if (cells[dateKey] !== "full") cells[dateKey] = "light";
  }
  const ordered = [
    ...routines.map((routine) => routine.id).filter((id) => cellsByRoutine.has(id)),
    ...seen.filter((id) => !routines.some((routine) => routine.id === id)),
  ];
  return ordered.map((id) => {
    const routine = routines.find((entry) => entry.id === id);
    return {
      id: `routine-${id}`,
      label: routine?.title ?? labelByRoutine.get(id) ?? "",
      icon: null,
      color: "",
      cells: cellsByRoutine.get(id) ?? {},
    };
  });
};

const buildTaskRows = (dayTasks: DayTask[]): TrackerRow[] =>
  dayTasks
    .filter(({ task }) => task.routineId === null)
    .sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? -1 : 1;
      return a.task.order - b.task.order;
    })
    .map(({ task, dateKey }) => ({
      id: `task-${task.id}`,
      label: task.title,
      icon: task.emoji,
      color: "",
      cells: { [dateKey]: task.status === "done" ? "full" : "light" },
    }));

export const buildMonthTracker = (
  input: MonthTrackerInput,
): TrackerSection[] => {
  const dayTasks = monthDayTasks(input.tasks, input.monthId);
  const habitRows = input.showHabits
    ? buildHabitRows(input.habits, input.habitChecksByDate, input.monthId)
    : [];
  const routineRows = buildRoutineRows(dayTasks, input.routines);
  const taskRows = buildTaskRows(dayTasks);

  let colorIndex = 0;
  const paint = (rows: TrackerRow[]): TrackerRow[] =>
    rows.map((row) => ({ ...row, color: colorAt(colorIndex++) }));

  const sections: TrackerSection[] = [
    { id: "habits", rows: paint(habitRows) },
    { id: "routines", rows: paint(routineRows) },
    { id: "tasks", rows: paint(taskRows) },
  ];
  return sections.filter((section) => section.rows.length > 0);
};
