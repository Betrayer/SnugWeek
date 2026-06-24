import { Group, Stack, Text } from "@mantine/core";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";

export interface HabitConsistencyItem {
  habitId: string;
  name: string;
  icon: string | null;
  pct: number;
}

interface HabitConsistencyListProps {
  data: HabitConsistencyItem[];
}

export const HabitConsistencyList = ({ data }: HabitConsistencyListProps) => (
  <Stack gap={10}>
    {data.map((habit) => {
      const pct = Math.round(habit.pct * 100);
      return (
        <Stack key={habit.habitId} gap={3}>
          <Group justify="space-between" gap="sm" wrap="nowrap">
            <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
              {habit.icon && (
                <span style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
                  <TrackerIcon icon={habit.icon} size={14} />
                </span>
              )}
              <Text fz="sm" c="var(--sw-ink)" truncate>
                {habit.name}
              </Text>
            </Group>
            <Text fz="xs" fw={700} c="var(--sw-ink-2)" style={{ flexShrink: 0 }}>
              {pct}%
            </Text>
          </Group>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "var(--sw-line)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: `color-mix(in srgb, var(--sw-accent) ${40 + Math.round(habit.pct * 60)}%, transparent)`,
                borderRadius: 4,
              }}
            />
          </div>
        </Stack>
      );
    })}
  </Stack>
);
