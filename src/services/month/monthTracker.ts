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

export type TrackerSectionId = "habits" | "routines";

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

export const MONTH_ROW_COLORS = [
  "#e2574c",
  "#e88a36",
  "#d9b13a",
  "#86b94e",
  "#3fae8f",
  "#3f93cf",
  "#6f74d6",
  "#a566cf",
  "#d65ea6",
  "#c47b50",
  "#5aa6a0",
  "#b0863a",
];

const FALLBACK_COLOR = MONTH_ROW_COLORS[0] ?? "#e2574c";

const colorAt = (index: number): string =>
  MONTH_ROW_COLORS[index % MONTH_ROW_COLORS.length] ?? FALLBACK_COLOR;

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

export const buildMonthTracker = (
  input: MonthTrackerInput,
): TrackerSection[] => {
  const dayTasks = monthDayTasks(input.tasks, input.monthId);
  const habitRows = input.showHabits
    ? buildHabitRows(input.habits, input.habitChecksByDate, input.monthId)
    : [];
  const routineRows = buildRoutineRows(dayTasks, input.routines);

  let colorIndex = 0;
  const paint = (rows: TrackerRow[]): TrackerRow[] =>
    rows.map((row) => ({ ...row, color: colorAt(colorIndex++) }));

  const sections: TrackerSection[] = [
    { id: "habits", rows: paint(habitRows) },
    { id: "routines", rows: paint(routineRows) },
  ];
  return sections.filter((section) => section.rows.length > 0);
};
