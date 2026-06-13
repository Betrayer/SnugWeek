import type { CSSProperties } from "react";
import type { WeekDay } from "../../../services/time.ts";
import { DayColumn } from "./DayColumn.tsx";
import { WeekendStack } from "./WeekendStack.tsx";

interface WeekBoardProps {
  days: WeekDay[];
  daysOff: number[];
  columnMode: "cozy" | "equal";
}

const gridStyle = (columns: string): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: columns,
  gap: "var(--mantine-spacing-md)",
  alignItems: "start",
});

export const WeekBoard = ({ days, daysOff, columnMode }: WeekBoardProps) => {
  if (columnMode === "equal") {
    return (
      <div style={gridStyle("repeat(7, 1fr)")}>
        {days.map((day) => (
          <DayColumn
            key={day.iso}
            day={day}
            isOff={daysOff.includes(day.iso)}
          />
        ))}
      </div>
    );
  }
  const weekdays = days.slice(0, 5);
  const weekendDays = days.slice(5);
  return (
    <div style={gridStyle("repeat(5, 1fr) 0.72fr")}>
      {weekdays.map((day) => (
        <DayColumn key={day.iso} day={day} isOff={daysOff.includes(day.iso)} />
      ))}
      <WeekendStack days={weekendDays} daysOff={daysOff} />
    </div>
  );
};
