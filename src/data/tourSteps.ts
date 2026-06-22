export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  id: string;
  anchor: string | null;
  placement: TourPlacement;
}

export const TOUR_ANCHORS = {
  weekBoard: "week-board",
  addTask: "add-task",
  taskCard: "task-card",
  sidebar: "sidebar",
  trackers: "trackers",
  habits: "habits",
  weekNote: "week-note",
  navMonth: "nav-month",
  navStats: "nav-stats",
  navSettings: "nav-settings",
} as const;

export const TOUR_STEPS: TourStep[] = [
  { id: "welcome", anchor: null, placement: "center" },
  { id: "week", anchor: TOUR_ANCHORS.weekBoard, placement: "center" },
  { id: "add", anchor: TOUR_ANCHORS.addTask, placement: "right" },
  { id: "card", anchor: TOUR_ANCHORS.taskCard, placement: "right" },
  { id: "lists", anchor: TOUR_ANCHORS.sidebar, placement: "left" },
  { id: "trackers", anchor: TOUR_ANCHORS.trackers, placement: "bottom" },
  { id: "habits", anchor: TOUR_ANCHORS.habits, placement: "bottom" },
  { id: "note", anchor: TOUR_ANCHORS.weekNote, placement: "top" },
  { id: "month", anchor: TOUR_ANCHORS.navMonth, placement: "bottom" },
  { id: "stats", anchor: TOUR_ANCHORS.navStats, placement: "bottom" },
  { id: "settings", anchor: TOUR_ANCHORS.navSettings, placement: "bottom" },
];
