import i18next from "i18next";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { notifyInfo } from "../notify.ts";
import { subscribeWeeksTasks } from "../repos/tasksRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import { playReminder } from "../sound/soundService.ts";
import { addWeeks, currentWeekId, dateTimeOf } from "../time.ts";
import { showSystemNotification } from "./notificationPermission.ts";

const HORIZON_MS = 12 * 60 * 60 * 1000;
const ROLLOVER_MS = 30 * 60 * 1000;
const GRACE_MS = 60 * 60 * 1000;
const PRUNE_MS = 24 * 60 * 60 * 1000;
const STORE_KEY = "snugweek-reminded";

let activeUid: string | null = null;
let unsub: (() => void) | null = null;
let settingsUnsub: (() => void) | null = null;
let rolloverTimer: ReturnType<typeof setTimeout> | null = null;
let timers = new Map<string, ReturnType<typeof setTimeout>>();
let tasks: Task[] = [];
let weekIds: string[] = [];

const readRecord = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number") result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
};

const writeRecord = (record: Record<string, number>): void => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error(error);
  }
};

const isRecorded = (key: string): boolean => key in readRecord();

const record = (key: string): void => {
  const entries = readRecord();
  const now = Date.now();
  entries[key] = now;
  for (const [entry, at] of Object.entries(entries)) {
    if (now - at > PRUNE_MS) delete entries[entry];
  }
  writeRecord(entries);
};

const fireAtOf = (task: Task): number | null => {
  if (
    task.weekId === null ||
    task.day === null ||
    task.time === null ||
    task.remindOffsetMin === null
  ) {
    return null;
  }
  const base = dateTimeOf(task.weekId, task.day, task.time).getTime();
  return base - task.remindOffsetMin * 60000;
};

const fire = (task: Task, fireAt: number, key: string): void => {
  if (isRecorded(key)) return;
  record(key);
  const taskTime = fireAt + (task.remindOffsetMin ?? 0) * 60000;
  const minutes = Math.max(0, Math.round((taskTime - Date.now()) / 60000));
  notifyInfo(minutes <= 0 ? "reminders:toastDue" : "reminders:toastSoon", {
    title: task.title,
    min: minutes,
  });
  const body =
    minutes <= 0
      ? i18next.t("reminders:dueShort")
      : i18next.t("reminders:soonShort", { min: minutes });
  showSystemNotification(task.title, body, task.id);
  playReminder();
};

const clearTimers = (): void => {
  for (const id of timers.values()) clearTimeout(id);
  timers = new Map();
};

const scheduleRollover = (): void => {
  if (rolloverTimer) clearTimeout(rolloverTimer);
  rolloverTimer = setTimeout(refresh, ROLLOVER_MS);
};

const rearm = (): void => {
  clearTimers();
  if (!activeUid) return;
  if (useSettingsStore.getState().remindersEnabled) {
    const now = Date.now();
    for (const task of tasks) {
      const fireAt = fireAtOf(task);
      if (fireAt === null) continue;
      const key = `${task.id}:${fireAt}`;
      if (isRecorded(key)) continue;
      const delta = fireAt - now;
      if (delta <= 0) {
        if (delta >= -GRACE_MS) fire(task, fireAt, key);
        continue;
      }
      if (delta <= HORIZON_MS) {
        timers.set(
          key,
          setTimeout(() => fire(task, fireAt, key), delta),
        );
      }
    }
  }
  scheduleRollover();
};

const desiredWeekIds = (): string[] => {
  const current = currentWeekId();
  return [current, addWeeks(current, 1)];
};

const sameIds = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const ensureSubscription = (): void => {
  if (!activeUid) return;
  const desired = desiredWeekIds();
  if (unsub && sameIds(desired, weekIds)) return;
  if (unsub) unsub();
  weekIds = desired;
  const uid = activeUid;
  unsub = subscribeWeeksTasks(uid, desired, (next) => {
    tasks = next.filter(
      (task) =>
        task.status === "open" &&
        task.time !== null &&
        task.remindOffsetMin !== null,
    );
    rearm();
  });
};

function refresh(): void {
  ensureSubscription();
  rearm();
}

const onVisible = (): void => {
  if (document.visibilityState === "visible") refresh();
};

export const startReminderScheduler = (uid: string): void => {
  if (activeUid === uid) return;
  stopReminderScheduler();
  activeUid = uid;
  document.addEventListener("visibilitychange", onVisible);
  settingsUnsub = useSettingsStore.subscribe((state, prev) => {
    if (state.remindersEnabled !== prev.remindersEnabled) rearm();
  });
  ensureSubscription();
  rearm();
};

export const stopReminderScheduler = (): void => {
  clearTimers();
  if (rolloverTimer) {
    clearTimeout(rolloverTimer);
    rolloverTimer = null;
  }
  if (unsub) {
    unsub();
    unsub = null;
  }
  if (settingsUnsub) {
    settingsUnsub();
    settingsUnsub = null;
  }
  document.removeEventListener("visibilitychange", onVisible);
  activeUid = null;
  tasks = [];
  weekIds = [];
};
