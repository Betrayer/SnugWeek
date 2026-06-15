import type { Task } from "../../../services/repos/tasksRepo.ts";

const byOrder = (a: Task, b: Task): number => a.order - b.order;

const byTimeThenOrder = (a: Task, b: Task): number => {
  if (a.time !== null && b.time !== null) {
    if (a.time !== b.time) return a.time < b.time ? -1 : 1;
    return a.order - b.order;
  }
  if (a.time !== null) return -1;
  if (b.time !== null) return 1;
  return a.order - b.order;
};

export const sortForDisplay = (tasks: Task[]): Task[] => {
  const open = tasks
    .filter((task) => task.status === "open")
    .sort(byTimeThenOrder);
  const done = tasks.filter((task) => task.status === "done").sort(byOrder);
  return [...open, ...done];
};
