import { Group, Stack, Text } from "@mantine/core";
import type { MonthHabitView } from "../../../services/stats/monthStatsData.ts";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";

interface HabitMonthListProps {
  habits: MonthHabitView[];
}

const weekFill = (checked: number, pct: number): string =>
  checked === 0
    ? "var(--sw-line)"
    : `color-mix(in srgb, var(--sw-accent) ${30 + Math.round(pct * 70)}%, transparent)`;

export const HabitMonthList = ({ habits }: HabitMonthListProps) => (
  <Stack gap="sm">
    {habits.map((habit) => (
      <Stack key={habit.habitId} gap={4}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            {habit.icon && (
              <span style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
                <TrackerIcon icon={habit.icon} size={15} />
              </span>
            )}
            <Text fz="sm" c="var(--sw-ink)" truncate>
              {habit.name}
            </Text>
          </Group>
          <Text fz="sm" fw={700} c="var(--sw-accent)">
            {Math.round(habit.pct * 100)}%
          </Text>
        </Group>
        <Group gap={4} wrap="nowrap">
          {habit.weeks.map((week) => (
            <div
              key={week.weekId}
              title={`${Math.round(week.pct * 100)}%`}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: weekFill(week.checked, week.pct),
              }}
            />
          ))}
        </Group>
      </Stack>
    ))}
  </Stack>
);
