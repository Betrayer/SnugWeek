import type { TFunction } from "i18next";
import type { Tracker } from "../../../services/repos/trackersRepo.ts";

export const trackerDisplayName = (tracker: Tracker, t: TFunction): string =>
  tracker.name.trim().length > 0
    ? tracker.name
    : t(`trackers:defaults.${tracker.id}`, { defaultValue: tracker.name });
