import { fetchCachedWeeksTasks } from "../repos/tasksRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import { fetchCachedWeeks } from "../repos/weeksRepo.ts";
import { addWeeks, currentWeekId } from "../time.ts";
import type { NoteEntry } from "./searchIndex.ts";

const RECENT_PAST = 21;
const RECENT_FUTURE = 4;

const recentWeekIds = (): string[] => {
  const base = currentWeekId();
  const ids: string[] = [];
  for (let offset = RECENT_FUTURE; offset >= -RECENT_PAST; offset -= 1) {
    ids.push(addWeeks(base, offset));
  }
  return ids;
};

export interface RemoteCorpus {
  tasks: Task[];
  notes: NoteEntry[];
}

export const loadRemoteCorpus = async (uid: string): Promise<RemoteCorpus> => {
  const weekIds = recentWeekIds();
  const [tasks, weeks] = await Promise.all([
    fetchCachedWeeksTasks(uid, weekIds),
    fetchCachedWeeks(uid, weekIds),
  ]);
  const notes: NoteEntry[] = [];
  for (const [weekId, week] of Object.entries(weeks)) {
    if (week.note.trim().length > 0) {
      notes.push({ weekId, day: null, text: week.note });
    }
    for (const [day, text] of Object.entries(week.dayNotes)) {
      if (text.trim().length > 0) {
        notes.push({ weekId, day: Number(day), text });
      }
    }
  }
  return { tasks, notes };
};
