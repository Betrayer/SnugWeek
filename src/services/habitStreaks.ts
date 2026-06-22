import { fetchWeeks } from "./repos/weeksRepo.ts";
import { addWeeks, currentWeekId, todayIsoDay } from "./time.ts";

const LOOKBACK_WEEKS = 8;

export interface HabitSchedule {
  id: string;
  days: number[];
}

export const computeHabitStreaks = async (
  uid: string,
  habits: HabitSchedule[],
): Promise<Record<string, number>> => {
  if (habits.length === 0) return {};
  const weeks: string[] = [];
  let cursor = currentWeekId();
  for (let index = 0; index < LOOKBACK_WEEKS; index += 1) {
    weeks.push(cursor);
    cursor = addWeeks(cursor, -1);
  }
  const docs = await fetchWeeks(uid, weeks);
  const known = new Set(weeks);

  const result: Record<string, number> = {};
  for (const habit of habits) {
    const scheduled = new Set(habit.days);
    let streak = 0;
    let weekId = currentWeekId();
    let day = todayIsoDay();
    while (known.has(weekId)) {
      if (scheduled.has(day)) {
        const checked =
          docs[weekId]?.habitChecks[habit.id]?.[String(day)] === true;
        if (!checked) break;
        streak += 1;
      }
      day -= 1;
      if (day < 1) {
        day = 7;
        weekId = addWeeks(weekId, -1);
      }
    }
    result[habit.id] = streak;
  }
  return result;
};
