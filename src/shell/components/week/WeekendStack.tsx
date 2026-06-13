import { Stack } from "@mantine/core";
import type { WeekDay } from "../../../services/time.ts";
import { DayColumn } from "./DayColumn.tsx";

interface WeekendStackProps {
  days: WeekDay[];
  daysOff: number[];
}

export const WeekendStack = ({ days, daysOff }: WeekendStackProps) => (
  <Stack gap="md">
    {days.map((day) => (
      <DayColumn key={day.iso} day={day} isOff={daysOff.includes(day.iso)} />
    ))}
  </Stack>
);
