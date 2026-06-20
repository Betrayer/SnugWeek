import { buildSnapshot } from "../../../services/share/buildSnapshot.ts";
import type {
  ShareInclude,
  ShareSnapshot,
  WeekViewModel,
} from "../../../services/share/shareTypes.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useTrackersStore } from "../../../state/trackersStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";

export interface CollectedWeek {
  weekId: string;
  language: string;
  themeId: string;
  notebookName: string | null;
  weekTitle: string;
  include: ShareInclude;
  snapshot: ShareSnapshot;
  model: WeekViewModel;
}

export const collectWeek = (include: ShareInclude): CollectedWeek | null => {
  const week = useWeekStore.getState();
  if (!week.weekId) return null;
  const profile = useProfileStore.getState();
  const language = useSettingsStore.getState().language;
  const { weekTitle, snapshot } = buildSnapshot({
    weekId: week.weekId,
    language,
    week: week.week,
    tasksByDay: week.tasksByDay,
    trackers: useTrackersStore.getState().trackers,
    habits: useHabitsStore.getState().habits,
    weekend: profile.weekend,
    include,
  });
  return {
    weekId: week.weekId,
    language,
    themeId: profile.themeId,
    notebookName: profile.notebookName,
    weekTitle,
    include,
    snapshot,
    model: {
      weekTitle,
      notebookName: profile.notebookName,
      include,
      snapshot,
    },
  };
};
