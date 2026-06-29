import { arrayMove } from "@dnd-kit/sortable";
import { needsRenormalize, orderBetween, renormalize } from "./ordering.ts";
import {
  dayContainerId,
  parseContainerId,
  parseDayColumnId,
} from "../shell/components/tasks/dndIds.ts";
import type { Task, TaskLocation } from "./repos/tasksRepo.ts";

interface ResolveMoveArgs {
  activeId: string;
  overId: string;
  containers: Record<string, Task[]>;
  weekId: string | null;
}

export interface MoveResult {
  taskId: string;
  location: TaskLocation;
  order: number;
  reorders: { id: string; order: number }[];
}

const locationForContainer = (
  containerId: string,
  weekId: string | null,
): TaskLocation | null => {
  const parsed = parseContainerId(containerId);
  if (!parsed) return null;
  if (parsed.kind === "day") {
    if (!weekId) return null;
    return { bucket: "day", weekId, day: parsed.day, listId: null };
  }
  return { bucket: "list", weekId: null, day: null, listId: parsed.listId };
};

const findContainerOf = (
  containers: Record<string, Task[]>,
  taskId: string,
): string | null =>
  Object.keys(containers).find((key) =>
    (containers[key] ?? []).some((task) => task.id === taskId),
  ) ?? null;

export const resolveMove = ({
  activeId,
  overId,
  containers,
  weekId,
}: ResolveMoveArgs): MoveResult | null => {
  const sourceId = findContainerOf(containers, activeId);
  if (!sourceId) return null;

  const dayColumn = parseDayColumnId(overId);
  const normalizedOverId =
    dayColumn !== null ? dayContainerId(dayColumn) : overId;

  const overIsContainer = parseContainerId(normalizedOverId) !== null;
  const destId = overIsContainer
    ? normalizedOverId
    : (findContainerOf(containers, normalizedOverId) ?? sourceId);

  const location = locationForContainer(destId, weekId);
  if (!location) return null;

  const source = containers[sourceId] ?? [];
  const dest = containers[destId] ?? [];

  let order: number;
  if (destId === sourceId) {
    const oldIndex = source.findIndex((task) => task.id === activeId);
    let newIndex: number;
    if (overIsContainer) {
      newIndex = source.length - 1;
    } else {
      const overIndex = source.findIndex((task) => task.id === normalizedOverId);
      newIndex = overIndex < 0 ? source.length - 1 : overIndex;
    }
    if (oldIndex < 0 || oldIndex === newIndex) return null;
    const reordered = arrayMove(source, oldIndex, newIndex);
    const pos = reordered.findIndex((task) => task.id === activeId);
    order = orderBetween(reordered[pos - 1], reordered[pos + 1]);
  } else {
    let insertIndex: number;
    if (overIsContainer) {
      insertIndex = dest.length;
    } else {
      const overIndex = dest.findIndex((task) => task.id === normalizedOverId);
      insertIndex = overIndex < 0 ? dest.length : overIndex;
    }
    order = orderBetween(dest[insertIndex - 1], dest[insertIndex]);
  }

  const projected = [
    ...dest
      .filter((task) => task.id !== activeId)
      .map((task) => ({ id: task.id, order: task.order })),
    { id: activeId, order },
  ].sort((a, b) => a.order - b.order);

  let finalOrder = order;
  let reorders: { id: string; order: number }[] = [];
  if (needsRenormalize(projected)) {
    const renormed = renormalize(projected);
    const activeSlot = renormed.find((item) => item.id === activeId);
    finalOrder = activeSlot ? activeSlot.order : order;
    reorders = renormed.filter((item) => item.id !== activeId);
  }

  return { taskId: activeId, location, order: finalOrder, reorders };
};
