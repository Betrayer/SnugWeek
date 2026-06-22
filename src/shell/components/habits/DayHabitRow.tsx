import { Group, Text, UnstyledButton } from "@mantine/core";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { CheckGlyph } from "../icons/glyphs.tsx";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";

interface DayHabitRowProps {
  day: number;
  dayLabel: string;
}

const EMPTY_CHECKS: Record<string, Record<string, true>> = {};

const chipStyle = (checked: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  maxWidth: 150,
  paddingInline: 8,
  paddingBlock: 3,
  borderRadius: 999,
  border: `1.5px solid ${checked ? "var(--sw-accent)" : "var(--sw-line)"}`,
  backgroundColor: checked
    ? "color-mix(in srgb, var(--sw-accent) 14%, transparent)"
    : "transparent",
  color: checked ? "var(--sw-accent-2)" : "var(--sw-ink-2)",
  transition: "background-color 120ms ease, border-color 120ms ease",
});

export const DayHabitRow = ({ day, dayLabel }: DayHabitRowProps) => {
  const { t } = useTranslation("habits");
  const habits = useHabitsStore((state) => state.habits);
  const checks = useWeekStore(
    (state) => state.week?.habitChecks ?? EMPTY_CHECKS,
  );
  const weekId = useWeekStore((state) => state.weekId);
  const active = habits.filter(
    (habit) => !habit.archived && habit.days.includes(day),
  );
  if (!weekId || active.length === 0) return null;

  return (
    <Group gap={6} wrap="wrap" data-tour={TOUR_ANCHORS.habits} style={{ rowGap: 6 }}>
      {active.map((habit) => {
        const checked = checks[habit.id]?.[String(day)] === true;
        return (
          <UnstyledButton
            key={habit.id}
            onClick={() => useWeekStore.getState().toggleHabit(habit.id, day)}
            aria-label={t("check", { name: habit.name, day: dayLabel })}
            aria-pressed={checked}
            title={habit.name}
            style={chipStyle(checked)}
          >
            {checked ? (
              <CheckGlyph size={12} color="var(--sw-accent-2)" />
            ) : habit.icon ? (
              <TrackerIcon icon={habit.icon} size={14} color="var(--sw-ink-3)" />
            ) : null}
            <Text fz="xs" fw={600} truncate style={{ minWidth: 0 }}>
              {habit.name}
            </Text>
          </UnstyledButton>
        );
      })}
    </Group>
  );
};
