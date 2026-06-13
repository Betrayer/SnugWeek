import { UnstyledButton } from "@mantine/core";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { initialDayIndex } from "../../../services/time.ts";
import type { WeekDay } from "../../../services/time.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { DayColumn } from "./DayColumn.tsx";

interface MobileDayPagerProps {
  days: WeekDay[];
  daysOff: number[];
  weekId: string;
}

const EMPTY: Task[] = [];

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
}: MobileDayPagerProps) => {
  const pagerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() => initialDayIndex(weekId));
  const tasksByDay = useWeekStore((state) => state.tasksByDay);

  useEffect(() => {
    const element = pagerRef.current;
    if (!element) return;
    const index = initialDayIndex(weekId);
    element.scrollLeft = index * element.clientWidth;
    setActive(index);
  }, [weekId]);

  const handleScroll = () => {
    const element = pagerRef.current;
    if (!element || element.clientWidth === 0) return;
    setActive(Math.round(element.scrollLeft / element.clientWidth));
  };

  const goToDay = (index: number) => {
    const element = pagerRef.current;
    if (!element) return;
    element.scrollTo({ left: index * element.clientWidth, behavior: "smooth" });
    setActive(index);
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
          display: "flex",
          justifyContent: "center",
          gap: 8,
          paddingBlock: 8,
        }}
      >
        {days.map((day, index) => {
          const openCount = (tasksByDay[day.iso] ?? EMPTY).filter(
            (task) => task.status === "open",
          ).length;
          return (
            <UnstyledButton
              key={day.iso}
              onClick={() => goToDay(index)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={dotStyle(index === active)}>{day.initial}</span>
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
