import { DndContext } from "@dnd-kit/core";
import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import {
  currentWeekId,
  isValidWeekId,
  todayIsoDay,
  weekDays,
} from "../../services/time.ts";
import { coverBackground } from "../../data/covers.ts";
import { TOUR_ANCHORS } from "../../data/tourSteps.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useDecorStore } from "../../state/decorStore.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { useWeekStore } from "../../state/weekStore.ts";
import { DecorEditBar } from "../components/decor/DecorEditBar.tsx";
import { DecorationLayer } from "../components/decor/DecorationLayer.tsx";
import { DecorationPalette } from "../components/decor/DecorationPalette.tsx";
import { WeekRecapBanner } from "../components/recap/WeekRecapBanner.tsx";
import { MobileQuickAdd } from "../components/tasks/MobileQuickAdd.tsx";
import { TaskDragOverlay } from "../components/tasks/TaskDragOverlay.tsx";
import { WeekTransitionHost } from "../components/transitions/WeekTransitionHost.tsx";
import { MobileDayPager } from "../components/week/MobileDayPager.tsx";
import { WeekBoard } from "../components/week/WeekBoard.tsx";
import { useIsMobile } from "../hooks/useIsMobile.ts";
import { useTaskDnd } from "../hooks/useTaskDnd.ts";
import { SidebarPanel } from "../layout/SidebarPanel.tsx";

const DESKTOP_HEIGHT =
  "calc(100vh - var(--app-shell-header-height, 56px) - var(--mantine-spacing-md) * 2)";
const MOBILE_HEIGHT =
  "calc(100vh - var(--app-shell-header-height, 56px) - var(--app-shell-footer-height, 64px) - var(--mantine-spacing-md) * 2)";

const surfaceStyle = {
  position: "relative",
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  gap: "var(--mantine-spacing-md)",
} as const;

export const WeekPage = () => {
  const params = useParams();
  const weekId =
    params.weekId && isValidWeekId(params.weekId)
      ? params.weekId
      : currentWeekId();
  const [searchParams, setSearchParams] = useSearchParams();
  const uid = useAuthStore((state) => state.uid);
  const language = useSettingsStore((state) => state.language);
  const columnMode = useProfileStore((state) => state.columnMode);
  const weekend = useProfileStore((state) => state.weekend);
  const coverStyle = useProfileStore((state) => state.coverStyle);
  const week = useWeekStore((state) => state.week);
  const isMobile = useIsMobile();
  const dnd = useTaskDnd();

  const cover = coverBackground(coverStyle);
  const coverStyleProps = cover
    ? {
        background: cover,
        borderRadius: "var(--mantine-radius-lg)",
        padding: 6,
      }
    : null;

  useEffect(() => {
    if (uid) useWeekStore.getState().open(uid, weekId);
  }, [uid, weekId]);

  useEffect(() => () => useDecorStore.getState().exitEdit(), []);

  useEffect(() => {
    if (isMobile) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "n" && event.key !== "N") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const active = document.activeElement;
      const tag = active?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      const target = weekId === currentWeekId() ? todayIsoDay() : 1;
      const node = document.querySelector(`[data-sw-add-day="${target}"]`);
      if (node instanceof HTMLButtonElement) {
        event.preventDefault();
        node.click();
      } else if (node instanceof HTMLInputElement) {
        event.preventDefault();
        node.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, weekId]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action !== "add" && action !== "today") return;
    const next = new URLSearchParams(searchParams);
    next.delete("action");
    setSearchParams(next, { replace: true });
    const today = weekId === currentWeekId() ? todayIsoDay() : 1;
    useUiStore.getState().setActiveMobileDay(today);
    if (action !== "add") return;
    if (isMobile) {
      useUiStore.getState().requestQuickAdd();
      return;
    }
    window.requestAnimationFrame(() => {
      const node = document.querySelector(`[data-sw-add-day="${today}"]`);
      if (node instanceof HTMLButtonElement) node.click();
      else if (node instanceof HTMLInputElement) node.focus();
    });
  }, [searchParams, setSearchParams, isMobile, weekId]);

  const days = useMemo(() => weekDays(weekId, language), [weekId, language]);
  const daysOff = week?.daysOff ?? weekend;
  const showRecap = weekId === currentWeekId() && todayIsoDay() === 7;

  const content = isMobile ? (
    <div
      style={{
        height: MOBILE_HEIGHT,
        display: "flex",
        flexDirection: "column",
        gap: "var(--mantine-spacing-sm)",
        ...coverStyleProps,
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <WeekTransitionHost weekId={weekId}>
          <div style={surfaceStyle} data-tour={TOUR_ANCHORS.weekBoard}>
            <MobileDayPager days={days} daysOff={daysOff} weekId={weekId} />
            <DecorationLayer scope="week" />
          </div>
        </WeekTransitionHost>
      </div>
      <MobileQuickAdd />
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--mantine-spacing-sm)",
        height: DESKTOP_HEIGHT,
        ...coverStyleProps,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: "var(--mantine-spacing-lg)",
        }}
      >
        <div
          style={{ flex: 1, minWidth: 0, minHeight: 0, position: "relative" }}
        >
          <WeekTransitionHost weekId={weekId}>
            <div style={surfaceStyle} data-tour={TOUR_ANCHORS.weekBoard}>
              <WeekBoard days={days} daysOff={daysOff} columnMode={columnMode} />
              <DecorationLayer scope="week" />
            </div>
          </WeekTransitionHost>
        </div>
        <div style={{ flex: "0 0 320px", minHeight: 0, display: "flex" }}>
          <SidebarPanel />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DndContext
        sensors={dnd.sensors}
        collisionDetection={dnd.collisionDetection}
        onDragStart={dnd.onDragStart}
        onDragEnd={dnd.onDragEnd}
        onDragCancel={dnd.onDragCancel}
      >
        {content}
        <TaskDragOverlay task={dnd.activeTask} list={dnd.activeList} />
      </DndContext>
      <DecorationPalette />
      <DecorEditBar />
      {showRecap && <WeekRecapBanner weekId={weekId} />}
    </>
  );
};
