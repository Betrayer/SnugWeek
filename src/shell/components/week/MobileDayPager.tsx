import { UnstyledButton } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { currentWeekId, todayIsoDay } from "../../../services/time.ts";
import type { WeekDay } from "../../../services/time.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { DayColumn } from "./DayColumn.tsx";

interface MobileDayPagerProps {
  days: WeekDay[];
  daysOff: number[];
  weekId: string;
  rightSlot?: ReactNode;
}

const EMPTY: Task[] = [];

const clampIndex = (index: number): number => Math.min(Math.max(index, 0), 6);

const defaultIso = (weekId: string): number =>
  weekId === currentWeekId() ? todayIsoDay() : 1;

const dotStyle = (active: boolean): CSSProperties => ({
  width: 28,
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  fontSize: "var(--mantine-font-size-xs)",
  fontWeight: 700,
  color: active ? "var(--sw-accent-ink)" : "var(--sw-ink-3)",
  backgroundColor: active ? "var(--sw-accent)" : "transparent",
});

export const MobileDayPager = ({
  days,
  daysOff,
  weekId,
  rightSlot,
}: MobileDayPagerProps) => {
  const pagerRef = useRef<HTMLDivElement>(null);
  const tasksByDay = useWeekStore((state) => state.tasksByDay);
  const activeIso = useUiStore((state) => state.activeMobileDay);
  const setActiveMobileDay = useUiStore((state) => state.setActiveMobileDay);

  const activeIndex = clampIndex((activeIso ?? defaultIso(weekId)) - 1);

  useEffect(() => {
    const stored = useUiStore.getState().activeMobileDay;
    const iso = stored ?? defaultIso(weekId);
    const index = clampIndex(iso - 1);
    const element = pagerRef.current;
    if (element) element.scrollLeft = index * element.clientWidth;
    if (stored === null) setActiveMobileDay(iso);
  }, [weekId, setActiveMobileDay]);

  const handleScroll = () => {
    const element = pagerRef.current;
    if (!element || element.clientWidth === 0) return;
    const iso = clampIndex(Math.round(element.scrollLeft / element.clientWidth)) + 1;
    if (iso !== useUiStore.getState().activeMobileDay) setActiveMobileDay(iso);
  };

  const goToDay = (index: number) => {
    const element = pagerRef.current;
    if (element)
      element.scrollTo({ left: index * element.clientWidth, behavior: "smooth" });
    setActiveMobileDay(index + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          gap: 8,
          paddingBlock: 8,
        }}
      >
        {days.map((day, index) => {
          const openCount = (tasksByDay[day.iso] ?? EMPTY).filter(
            (task) => task.status === "open" && !task.carriedOut,
          ).length;
          return (
            <UnstyledButton
              key={day.iso}
              onClick={() => goToDay(index)}
              aria-label={day.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={dotStyle(index === activeIndex)}>{day.initial}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  minHeight: 11,
                  color: openCount > 0 ? "var(--sw-ink-3)" : "transparent",
                }}
              >
                {openCount > 0 ? openCount : "·"}
              </span>
            </UnstyledButton>
          );
        })}
        {rightSlot}
      </div>
      <div
        ref={pagerRef}
        onScroll={handleScroll}
        className="sw-hide-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {days.map((day) => (
          <div
            key={day.iso}
            style={{
              flex: "0 0 100%",
              minHeight: 0,
              scrollSnapAlign: "start",
              paddingInline: 2,
            }}
          >
            <DayColumn day={day} isOff={daysOff.includes(day.iso)} />
          </div>
        ))}
      </div>
    </div>
  );
};
