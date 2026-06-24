import type { TrackerType } from "../repos/trackersRepo.ts";
import type { TrackerValue } from "../repos/weeksRepo.ts";
import { moodScale } from "./moodScale.ts";

export const numericTrackerValue = (
  value: TrackerValue | undefined,
  type: TrackerType,
): number | null => {
  if (value === undefined) return null;
  if (type === "emoji") return moodScale(value);
  if (type === "checkbox") {
    if (value === true) return 1;
    if (value === false) return 0;
    return null;
  }
  return typeof value === "number" ? value : null;
};
