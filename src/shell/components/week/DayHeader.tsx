import { Group, Text } from "@mantine/core";
import type { WeekDay } from "../../../services/time.ts";

interface DayHeaderProps {
  day: WeekDay;
  isOff: boolean;
}

export const DayHeader = ({ day, isOff }: DayHeaderProps) => {
  const color = isOff
    ? "var(--sw-ink-3)"
    : day.isToday
      ? "var(--sw-accent-2)"
      : "var(--sw-ink)";
  return (
    <Group justify="space-between" wrap="nowrap" style={{ color }}>
      <Text fw={700} fz="sm">
        {day.label}
      </Text>
      {day.isToday && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--sw-accent)",
          }}
        />
      )}
    </Group>
  );
};
