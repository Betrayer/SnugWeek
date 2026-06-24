import type { Routine } from "../repos/routinesRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import { isoDateKey } from "../time.ts";

export interface RoutineAdherenceDatum {
  routineId: string;
  title: string;
  generated: number;
  completed: number;
  rate: number | null;
}

export const routineAdherence = (
  tasks: Task[],
  routines: Routine[],
  inPeriod: (dateKey: string) => boolean,
): RoutineAdherenceDatum[] => {
  const generated = new Map<string, number>();
  const completed = new Map<string, number>();
  for (const task of tasks) {
    if (task.routineId === null || task.weekId === null || task.day === null) {
      continue;
    }
    const dateKey = isoDateKey(task.weekId, task.day);
    if (!inPeriod(dateKey)) continue;
    generated.set(task.routineId, (generated.get(task.routineId) ?? 0) + 1);
    if (task.status === "done") {
      completed.set(task.routineId, (completed.get(task.routineId) ?? 0) + 1);
    }
  }
  const result: RoutineAdherenceDatum[] = [];
  for (const routine of routines) {
    const gen = generated.get(routine.id) ?? 0;
    if (gen === 0) continue;
    const done = completed.get(routine.id) ?? 0;
    result.push({
      routineId: routine.id,
      title: routine.title,
      generated: gen,
      completed: done,
      rate: gen === 0 ? null : done / gen,
    });
  }
  return result;
};
