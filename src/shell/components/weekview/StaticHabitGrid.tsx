import { Group, Stack, Text } from "@mantine/core";
import type { CSSProperties } from "react";
import type {
  ShareSnapshot,
  WeekViewDay,
  WeekViewHabit,
} from "../../../services/share/shareTypes.ts";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";
import { CheckGlyph } from "../icons/glyphs.tsx";

interface StaticHabitGridProps {
  habits: WeekViewHabit[];
  checks: ShareSnapshot["habitChecks"];
  days: WeekViewDay[];
}

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 5,
  alignItems: "center",
};

const cell = (checked: boolean): CSSProperties => ({
  width: 24,
  height: 24,
  margin: "0 auto",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1.5px solid ${checked ? "var(--sw-accent)" : "var(--sw-line)"}`,
  backgroundColor: checked ? "var(--sw-accent)" : "transparent",
});

export const StaticHabitGrid = ({ habits, checks, days }: StaticHabitGridProps) => {
  if (habits.length === 0) return null;
  return (
    <Stack gap="md">
      <div style={gridStyle}>
        {days.map((day) => (
          <span
            key={day.iso}
            style={{
              textAlign: "center",
              fontSize: "var(--mantine-font-size-xs)",
              fontWeight: 700,
              color: "var(--sw-ink-3)",
            }}
          >
            {day.label.trim().charAt(0)}
          </span>
        ))}
      </div>
      {habits.map((habit) => (
        <Stack key={habit.id} gap={4}>
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            {habit.icon && (
              <TrackerIcon icon={habit.icon} size={16} color="var(--sw-ink-3)" />
            )}
            <Text fz="sm" fw={600} c="var(--sw-ink)" truncate style={{ minWidth: 0 }}>
              {habit.name}
            </Text>
          </Group>
          <div style={gridStyle}>
            {days.map((day) => (
              <span key={day.iso} style={cell(checks[habit.id]?.[String(day.iso)] === true)}>
                {checks[habit.id]?.[String(day.iso)] === true && (
                  <CheckGlyph size={13} />
                )}
              </span>
            ))}
          </div>
        </Stack>
      ))}
    </Stack>
  );
};
