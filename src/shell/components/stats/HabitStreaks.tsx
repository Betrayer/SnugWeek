import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Habit } from "../../../services/repos/habitsRepo.ts";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";

interface HabitStreaksProps {
  habits: Habit[];
  longest: Record<string, number>;
  current: Record<string, number>;
}

interface StreakValueProps {
  value: number;
  label: string;
  color: string;
}

const StreakValue = ({ value, label, color }: StreakValueProps) => {
  const { t } = useTranslation("stats");
  return (
    <Stack gap={0} align="center">
      <Text fz="lg" fw={700} c={color}>
        {value}
        <Text span fz="xs" c="var(--sw-ink-3)" ml={2}>
          {t("daysShort")}
        </Text>
      </Text>
      <Text fz={10} c="var(--sw-ink-3)">
        {label}
      </Text>
    </Stack>
  );
};

export const HabitStreaks = ({ habits, longest, current }: HabitStreaksProps) => {
  const { t } = useTranslation("stats");
  return (
    <Stack gap="sm">
      {habits.map((habit) => (
        <Group key={habit.id} justify="space-between" wrap="nowrap" gap="sm">
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
          <Group gap="lg" wrap="nowrap">
            <StreakValue
              value={current[habit.id] ?? 0}
              label={t("currentStreak")}
              color="var(--sw-accent)"
            />
            <StreakValue
              value={longest[habit.id] ?? 0}
              label={t("longestStreak")}
              color="var(--sw-ink-2)"
            />
          </Group>
        </Group>
      ))}
    </Stack>
  );
};
