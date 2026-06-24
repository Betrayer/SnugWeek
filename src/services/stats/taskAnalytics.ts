import { tagSwatchValue } from "../../data/tagColors.ts";
import type { Tag } from "../repos/tagsRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import { isoDayOfKey } from "../time.ts";

export interface WeekdayDatum {
  iso: number;
  done: number;
}

export const weekdayCompletion = (
  perDay: Record<string, number>,
): WeekdayDatum[] => {
  const totals = [0, 0, 0, 0, 0, 0, 0];
  for (const [key, count] of Object.entries(perDay)) {
    const iso = isoDayOfKey(key);
    if (iso >= 1 && iso <= 7) totals[iso - 1] = (totals[iso - 1] ?? 0) + count;
  }
  return totals.map((done, index) => ({ iso: index + 1, done }));
};

export type TimeOfDayBucket = "morning" | "afternoon" | "evening" | "night";

export const TIME_OF_DAY_BUCKETS: TimeOfDayBucket[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
];

export interface TimeOfDayDatum {
  bucket: TimeOfDayBucket;
  count: number;
}

const bucketOfHour = (hour: number): TimeOfDayBucket => {
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
};

export const timeOfDayDistribution = (
  tasks: Task[],
): { data: TimeOfDayDatum[]; total: number } => {
  const counts: Record<TimeOfDayBucket, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };
  let total = 0;
  for (const task of tasks) {
    if (task.time === null) continue;
    const hour = Number(task.time.slice(0, 2));
    if (Number.isNaN(hour)) continue;
    counts[bucketOfHour(hour)] += 1;
    total += 1;
  }
  return {
    data: TIME_OF_DAY_BUCKETS.map((bucket) => ({ bucket, count: counts[bucket] })),
    total,
  };
};

export interface TagDatum {
  id: string;
  name: string;
  color: string;
  count: number;
}

export const tagBreakdown = (tasks: Task[], tags: Tag[]): TagDatum[] => {
  const byId = new Map(tags.map((tag) => [tag.id, tag]));
  const counts = new Map<string, number>();
  for (const task of tasks) {
    for (const tagId of task.tagIds) {
      if (!byId.has(tagId)) continue;
      counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
    }
  }
  const result: TagDatum[] = [];
  for (const [id, count] of counts) {
    const tag = byId.get(id);
    if (!tag) continue;
    result.push({ id, name: tag.name, color: tagSwatchValue(tag.color), count });
  }
  return result.sort((a, b) => b.count - a.count);
};
