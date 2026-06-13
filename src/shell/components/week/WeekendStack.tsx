import type { WeekDay } from "../../../services/time.ts";
import { DayColumn } from "./DayColumn.tsx";

interface WeekendStackProps {
  days: WeekDay[];
  daysOff: number[];
}

export const WeekendStack = ({ days, daysOff }: WeekendStackProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "var(--mantine-spacing-md)",
      height: "100%",
      minHeight: 0,
    }}
  >
    {days.map((day) => (
      <div key={day.iso} style={{ flex: 1, minHeight: 0 }}>
        <DayColumn day={day} isOff={daysOff.includes(day.iso)} />
      </div>
    ))}
  </div>
);
