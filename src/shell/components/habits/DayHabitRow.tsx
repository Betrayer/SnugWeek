import { Group, UnstyledButton } from "@mantine/core";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { trackerColorValue } from "../../../data/trackerColors.ts";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";

interface DayHabitRowProps {
  day: number;
  dayLabel: string;
}

const EMPTY_CHECKS: Record<string, Record<string, true>> = {};

const BUTTON_SIZE = 30;

const buttonStyle = (checked: boolean, color: string): CSSProperties => ({
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  flex: "0 0 auto",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: `1.5px solid ${checked ? color : "var(--sw-line)"}`,
  backgroundColor: checked ? color : "transparent",
  color: checked ? "var(--mantine-color-white)" : "var(--sw-ink-3)",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1,
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
    <Group
      gap={6}
      wrap="wrap"
      data-tour={TOUR_ANCHORS.habits}
      style={{ rowGap: 6 }}
    >
      {active.map((habit) => {
        const checked = checks[habit.id]?.[String(day)] === true;
        const color = trackerColorValue(habit.color);
        return (
          <UnstyledButton
            key={habit.id}
            onClick={() => useWeekStore.getState().toggleHabit(habit.id, day)}
            aria-label={t("check", { name: habit.name, day: dayLabel })}
            aria-pressed={checked}
            title={habit.name}
            style={buttonStyle(checked, color)}
          >
            {habit.icon ? (
              <TrackerIcon
                icon={habit.icon}
                size={16}
                color={checked ? "var(--mantine-color-white)" : "var(--sw-ink-3)"}
              />
            ) : (
              <span aria-hidden>{habit.name.slice(0, 1).toUpperCase()}</span>
            )}
          </UnstyledButton>
        );
      })}
    </Group>
  );
};
