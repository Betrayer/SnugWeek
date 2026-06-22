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
import {
  LIST_SIDEBAR_DROP_ID,
  dayContainerId,
  listContainerId,
  parseDayColumnId,
  parseListDragId,
} from "../components/tasks/dndIds.ts";
import { sortForDisplay } from "../components/tasks/taskSort.ts";

interface ActiveList {
  id: string;
  name: string;
}

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
  const [activeList, setActiveList] = useState<ActiveList | null>(null);
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
    const activeId = String(event.active.id);
    const listId = parseListDragId(activeId);
    if (listId) {
      const list = useListsStore
        .getState()
        .lists.find((item) => item.id === listId);
      setActiveList({ id: listId, name: list?.name ?? "" });
      useUiStore.getState().setDragging({ taskId: activeId });
      return;
    }
    setActiveTask(findTask(activeId));
    useUiStore.getState().setDragging({ taskId: activeId });
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveList(null);
    useUiStore.getState().setDragging(null);
    const { active, over } = event;
    if (!over) return;
    const uid = useAuthStore.getState().uid;
    if (!uid) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const listId = parseListDragId(activeId);
    if (listId) {
      const day = parseDayColumnId(overId);
      if (day !== null) useListsStore.getState().assignListToDay(listId, day);
      else if (overId === LIST_SIDEBAR_DROP_ID)
        useListsStore.getState().unassignList(listId);
      return;
    }

    const isTouch =
      typeof TouchEvent !== "undefined" &&
      event.activatorEvent instanceof TouchEvent;
    if (isTouch && Math.abs(event.delta.x) < 6 && Math.abs(event.delta.y) < 6) {
      useUiStore.getState().openTask(activeId);
      return;
    }

    const result = resolveMove({
      activeId,
      overId,
      containers: buildContainers(),
      weekId: useWeekStore.getState().weekId,
    });
    if (!result) return;
    moveTask(uid, result.taskId, { ...result.location, order: result.order });
    if (result.reorders.length > 0) applyOrders(uid, result.reorders);
  };

  const onDragCancel = () => {
    setActiveTask(null);
    setActiveList(null);
    useUiStore.getState().setDragging(null);
  };

  const collisionDetection: CollisionDetection = (args) => {
    const isList = parseListDragId(String(args.active.id)) !== null;
    const containers = args.droppableContainers.filter((container) => {
      const id = String(container.id);
      const listTarget =
        parseDayColumnId(id) !== null || id === LIST_SIDEBAR_DROP_ID;
      return isList ? listTarget : !listTarget;
    });
    return closestCorners({ ...args, droppableContainers: containers });
  };

  return {
    sensors,
    collisionDetection,
    onDragStart,
    onDragEnd,
    onDragCancel,
    activeTask,
    activeList,
  };
};
