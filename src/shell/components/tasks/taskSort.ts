import type { Task } from "../../../services/repos/tasksRepo.ts";

export const sortForDisplay = (tasks: Task[]): Task[] => {
  const open = tasks.filter((task) => task.status === "open");
  const done = tasks.filter((task) => task.status === "done");
  return [...open, ...done];
};
