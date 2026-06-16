import type { Task } from "../repos/tasksRepo.ts";

export interface NoteEntry {
  weekId: string;
  day: number | null;
  text: string;
}

export interface TaskHit {
  task: Task;
  score: number;
}

export interface NoteHit {
  weekId: string;
  day: number | null;
  snippet: string;
  score: number;
}

const SNIPPET_RADIUS = 32;
const RECENT_MS = 14 * 24 * 60 * 60 * 1000;

const normalizeQuery = (value: string): string => value.toLowerCase().trim();

const titleScore = (title: string, query: string): number => {
  const value = title.toLowerCase();
  if (value === query) return 100;
  if (value.startsWith(query)) return 80;
  if (value.split(/\s+/).some((word) => word.startsWith(query))) return 60;
  const index = value.indexOf(query);
  if (index < 0) return -1;
  return 40 - Math.min(index, 30) * 0.3;
};

export const rankTasks = (
  tasks: Task[],
  rawQuery: string,
  now: number,
  limit: number,
): TaskHit[] => {
  const query = normalizeQuery(rawQuery);
  if (query.length === 0) return [];
  const hits: TaskHit[] = [];
  for (const task of tasks) {
    const base = titleScore(task.title, query);
    if (base < 0) continue;
    const openBoost = task.status === "open" ? 4 : 0;
    const recentBoost =
      now > 0 && now - task.updatedAt < RECENT_MS ? 3 : 0;
    hits.push({ task, score: base + openBoost + recentBoost });
  }
  hits.sort((a, b) => b.score - a.score || b.task.updatedAt - a.task.updatedAt);
  return hits.slice(0, limit);
};

const buildSnippet = (text: string, index: number, length: number): string => {
  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(text.length, index + length + SNIPPET_RADIUS);
  const core = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "… " : ""}${core}${end < text.length ? " …" : ""}`;
};

export const rankNotes = (
  notes: NoteEntry[],
  rawQuery: string,
  limit: number,
): NoteHit[] => {
  const query = normalizeQuery(rawQuery);
  if (query.length === 0) return [];
  const hits: NoteHit[] = [];
  for (const note of notes) {
    const index = note.text.toLowerCase().indexOf(query);
    if (index < 0) continue;
    hits.push({
      weekId: note.weekId,
      day: note.day,
      snippet: buildSnippet(note.text, index, query.length),
      score: 30 - Math.min(index, 40) * 0.2,
    });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
};
