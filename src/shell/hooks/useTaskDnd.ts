import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  CollisionDetection,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { applyOrders, moveTask } from "../../services/repos/tasksRepo.ts";
import type { Task } from "../../services/repos/tasksRepo.ts";
import { resolveMove } from "../../services/taskDnd.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useListsStore } from "../../state/listsStore.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { useWeekStore } from "../../state/weekStore.ts";
import { dayContainerId, listContainerId } from "../components/tasks/dndIds.ts";
import { sortForDisplay } from "../components/tasks/taskSort.ts";

const findTask = (taskId: string): Task | null => {
  const byDay = useWeekStore.getState().tasksByDay;
  for (const tasks of Object.values(byDay)) {
    const found = tasks.find((task) => task.id === taskId);
    if (found) return found;
  }
  const byList = useListsStore.getState().tasksByList;
  for (const tasks of Object.values(byList)) {
    const found = tasks.find((task) => task.id === taskId);
    if (found) return found;
  }
  return null;
};

const buildContainers = (): Record<string, Task[]> => {
  const containers: Record<string, Task[]> = {};
  const byDay = useWeekStore.getState().tasksByDay;
  for (const [day, tasks] of Object.entries(byDay)) {
    containers[dayContainerId(Number(day))] = sortForDisplay(tasks);
  }
  const byList = useListsStore.getState().tasksByList;
  for (const [listId, tasks] of Object.entries(byList)) {
    containers[listContainerId(listId)] = sortForDisplay(tasks);
  }
  return containers;
};

export const useTaskDnd = () => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    setActiveTask(findTask(taskId));
    useUiStore.getState().setDragging({ taskId });
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    useUiStore.getState().setDragging(null);
    const { active, over } = event;
    if (!over) return;
    const uid = useAuthStore.getState().uid;
    if (!uid) return;
    const result = resolveMove({
      activeId: String(active.id),
      overId: String(over.id),
      containers: buildContainers(),
      weekId: useWeekStore.getState().weekId,
    });
    if (!result) return;
    moveTask(uid, result.taskId, { ...result.location, order: result.order });
    if (result.reorders.length > 0) applyOrders(uid, result.reorders);
  };

  const onDragCancel = () => {
    setActiveTask(null);
    useUiStore.getState().setDragging(null);
  };

  const collisionDetection: CollisionDetection = closestCorners;

  return { sensors, collisionDetection, onDragStart, onDragEnd, onDragCancel, activeTask };
};
