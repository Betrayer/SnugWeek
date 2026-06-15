import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ORDER_SPACING, orderForBottom } from "../services/ordering.ts";
import { bumpCompletion } from "../services/repos/statsRepo.ts";
import {
  assignListToDay,
  createList,
  deleteListAndRehomeTasks,
  ensureBuiltinLists,
  isBuiltinList,
  renameList as renameListDoc,
  subscribeLists,
  unassignList,
} from "../services/repos/listsRepo.ts";
import type { List } from "../services/repos/listsRepo.ts";
import {
  createTask,
  deleteTask,
  setStatus,
  subscribeListTasks,
  updateTitle,
} from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import { playCheck, playPop, playSwoosh } from "../services/sound/soundService.ts";
import { isoDateKeyOf } from "../services/time.ts";
import { notifyInfo } from "../services/notify.ts";
import { useUiStore } from "./uiStore.ts";

const TASKS_LIST_ID = "tasks";

const activeFilterTagIds = (): string[] => useUiStore.getState().tagFilter;

interface ListsState {
  lists: List[];
  tasksByList: Record<string, Task[]>;
  start: (uid: string) => void;
  stop: () => void;
  addTask: (listId: string, title: string) => void;
  toggleDone: (task: Task) => void;
  renameTask: (taskId: string, title: string) => void;
  removeTask: (taskId: string) => void;
  addList: (name: string) => void;
  renameList: (listId: string, name: string) => void;
  removeList: (listId: string) => void;
  assignListToDay: (listId: string, day: number) => void;
  unassignList: (listId: string) => void;
}

let listsUnsub: (() => void) | null = null;
let tasksUnsub: (() => void) | null = null;
let activeUid: string | null = null;

const groupByList = (tasks: Task[]): Record<string, Task[]> => {
  const grouped: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (task.listId === null) continue;
    const bucket = grouped[task.listId] ?? [];
    bucket.push(task);
    grouped[task.listId] = bucket;
  }
  return grouped;
};

export const useListsStore = create<ListsState>()(
  devtools(
    (set, get) => ({
      lists: [],
      tasksByList: {},
      start: (uid) => {
        if (activeUid === uid && listsUnsub) return;
        if (listsUnsub) listsUnsub();
        if (tasksUnsub) tasksUnsub();
        activeUid = uid;
        set({ lists: [], tasksByList: {} });
        ensureBuiltinLists(uid).catch((error: unknown) => {
          console.error(error);
        });
        listsUnsub = subscribeLists(uid, (lists) => {
          set({ lists });
        });
        tasksUnsub = subscribeListTasks(uid, (tasks) => {
          set({ tasksByList: groupByList(tasks) });
        });
      },
      stop: () => {
        if (listsUnsub) listsUnsub();
        if (tasksUnsub) tasksUnsub();
        listsUnsub = null;
        tasksUnsub = null;
        activeUid = null;
        set({ lists: [], tasksByList: {} });
      },
      addTask: (listId, title) => {
        const trimmed = title.trim();
        if (!activeUid || trimmed.length === 0) return;
        const order = orderForBottom(get().tasksByList[listId] ?? []);
        createTask(activeUid, {
          title: trimmed,
          bucket: "list",
          weekId: null,
          day: null,
          listId,
          order,
          tagIds: activeFilterTagIds(),
        });
        playPop();
      },
      toggleDone: (task) => {
        if (!activeUid) return;
        if (task.status === "done") {
          if (task.completedAt !== null) {
            bumpCompletion(activeUid, isoDateKeyOf(task.completedAt), -1);
          }
          setStatus(activeUid, task.id, "open", null);
          return;
        }
        const now = Date.now();
        setStatus(activeUid, task.id, "done", now);
        bumpCompletion(activeUid, isoDateKeyOf(now), 1);
        playCheck();
      },
      renameTask: (taskId, title) => {
        const trimmed = title.trim();
        if (!activeUid || trimmed.length === 0) return;
        updateTitle(activeUid, taskId, trimmed);
      },
      removeTask: (taskId) => {
        if (!activeUid) return;
        deleteTask(activeUid, taskId);
        playSwoosh();
      },
      addList: (name) => {
        const trimmed = name.trim();
        if (!activeUid || trimmed.length === 0) return;
        createList(activeUid, trimmed, orderForBottom(get().lists));
      },
      renameList: (listId, name) => {
        const trimmed = name.trim();
        if (!activeUid || trimmed.length === 0 || isBuiltinList(listId)) return;
        renameListDoc(activeUid, listId, trimmed);
      },
      removeList: (listId) => {
        if (!activeUid || isBuiltinList(listId)) return;
        const tasks = get().tasksByList[listId] ?? [];
        const target = get().tasksByList[TASKS_LIST_ID] ?? [];
        const firstTarget = target[0];
        const ceiling = firstTarget
          ? firstTarget.order
          : tasks.length * ORDER_SPACING;
        const rehomed = tasks.map((task, index) => ({
          id: task.id,
          order: ceiling - (tasks.length - index) * ORDER_SPACING,
        }));
        deleteListAndRehomeTasks(activeUid, listId, rehomed);
        notifyInfo("tasks:listDeletedToast");
      },
      assignListToDay: (listId, day) => {
        if (!activeUid || isBuiltinList(listId)) return;
        const list = get().lists.find((item) => item.id === listId);
        if (list && list.day === day) return;
        assignListToDay(activeUid, listId, day);
      },
      unassignList: (listId) => {
        if (!activeUid || isBuiltinList(listId)) return;
        const list = get().lists.find((item) => item.id === listId);
        if (list && list.day === null) return;
        unassignList(activeUid, listId);
      },
    }),
    { name: "listsStore" },
  ),
);
