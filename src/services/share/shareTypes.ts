import type { TrackerType } from "../repos/trackersRepo.ts";
import type { Decoration, TrackerValue } from "../repos/weeksRepo.ts";

export const SHARE_SCHEMA_VERSION = 1;

export interface ShareInclude {
  tasks: boolean;
  note: boolean;
  trackers: boolean;
  habits: boolean;
  decorations: boolean;
}

export interface WeekViewTask {
  id: string;
  title: string;
  done: boolean;
  time: string | null;
}

export interface WeekViewDay {
  iso: number;
  label: string;
  isOff: boolean;
  tasks: WeekViewTask[];
  note: string;
}

export interface WeekViewTracker {
  id: string;
  name: string;
  type: TrackerType;
  icon: string;
}

export interface WeekViewHabit {
  id: string;
  name: string;
  icon: string | null;
}

export interface ShareSnapshot {
  days: WeekViewDay[];
  weekNote: string;
  trackers: WeekViewTracker[];
  trackerValues: Record<string, Record<string, TrackerValue>>;
  habits: WeekViewHabit[];
  habitChecks: Record<string, Record<string, boolean>>;
  decorations: Decoration[];
}

export interface ShareDoc {
  v: number;
  ownerUid: string;
  weekId: string;
  weekTitle: string;
  language: string;
  themeId: string;
  notebookName: string | null;
  createdAt: number;
  include: ShareInclude;
  snapshot: ShareSnapshot;
}

export interface WeekViewModel {
  weekTitle: string;
  notebookName: string | null;
  include: ShareInclude;
  snapshot: ShareSnapshot;
}

export interface ShareSummary {
  id: string;
  weekId: string;
  weekTitle: string;
  createdAt: number;
  include: ShareInclude;
}
