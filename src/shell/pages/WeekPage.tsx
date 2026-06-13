import { DndContext } from "@dnd-kit/core";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { currentWeekId, isValidWeekId, weekDays } from "../../services/time.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { useWeekStore } from "../../state/weekStore.ts";
import { WeekNote } from "../components/note/WeekNote.tsx";
import { TaskDragOverlay } from "../components/tasks/TaskDragOverlay.tsx";
import { MobileDayPager } from "../components/week/MobileDayPager.tsx";
import { WeekBoard } from "../components/week/WeekBoard.tsx";
import { useIsMobile } from "../hooks/useIsMobile.ts";
import { useTaskDnd } from "../hooks/useTaskDnd.ts";
import { SidebarPanel } from "../layout/SidebarPanel.tsx";

const DESKTOP_HEIGHT =
  "calc(100vh - var(--app-shell-header-height, 56px) - var(--mantine-spacing-md) * 2)";
const MOBILE_HEIGHT =
  "calc(100vh - var(--app-shell-header-height, 56px) - var(--app-shell-footer-height, 64px) - var(--mantine-spacing-md) * 2)";

export const WeekPage = () => {
  const params = useParams();
  const weekId =
    params.weekId && isValidWeekId(params.weekId)
      ? params.weekId
      : currentWeekId();
  const uid = useAuthStore((state) => state.uid);
  const language = useSettingsStore((state) => state.language);
  const week = useWeekStore((state) => state.week);
  const columnMode = useProfileStore((state) => state.columnMode);
  const weekend = useProfileStore((state) => state.weekend);
  const showNote = useProfileStore((state) => state.moduleToggles.weekNote);
  const isMobile = useIsMobile();
  const dnd = useTaskDnd();

  useEffect(() => {
    if (uid) useWeekStore.getState().open(uid, weekId);
  }, [uid, weekId]);

  const days = useMemo(() => weekDays(weekId, language), [weekId, language]);
  const daysOff = week?.daysOff ?? weekend;

  const content = isMobile ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--mantine-spacing-md)",
        height: MOBILE_HEIGHT,
      }}
    >
      <MobileDayPager days={days} daysOff={daysOff} weekId={weekId} />
      {showNote && <WeekNote />}
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        gap: "var(--mantine-spacing-lg)",
        height: DESKTOP_HEIGHT,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--mantine-spacing-md)",
        }}
      >
        <WeekBoard days={days} daysOff={daysOff} columnMode={columnMode} />
        {showNote && <WeekNote />}
      </div>
      <div style={{ flex: "0 0 320px", minHeight: 0, display: "flex" }}>
        <SidebarPanel />
      </div>
    </div>
  );

  return (
    <DndContext
      sensors={dnd.sensors}
      collisionDetection={dnd.collisionDetection}
      onDragStart={dnd.onDragStart}
      onDragEnd={dnd.onDragEnd}
      onDragCancel={dnd.onDragCancel}
    >
      {content}
      <TaskDragOverlay task={dnd.activeTask} />
    </DndContext>
  );
};
