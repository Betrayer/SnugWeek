import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { initialDayIndex } from "../../../services/time.ts";
import type { WeekDay } from "../../../services/time.ts";
import { DayColumn } from "./DayColumn.tsx";

interface MobileDayPagerProps {
  days: WeekDay[];
  daysOff: number[];
  weekId: string;
}

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

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          paddingBlock: 8,
        }}
      >
        {days.map((day, index) => (
          <span key={day.iso} style={dotStyle(index === active)}>
            {day.initial}
          </span>
        ))}
      </div>
      <div
        ref={pagerRef}
        onScroll={handleScroll}
        className="sw-hide-scrollbar"
        style={{
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
