import { Box, Stack, Text } from "@mantine/core";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { WeekViewModel } from "../../../services/share/shareTypes.ts";
import { StaticDayCard } from "./StaticDayCard.tsx";
import { StaticDecorations } from "./StaticDecorations.tsx";
import { StaticHabitGrid } from "./StaticHabitGrid.tsx";
import { cardSurface } from "../../styles/surfaces.ts";

interface WeekViewProps {
  model: WeekViewModel;
  variant: "screen" | "print";
}

const gridStyle = (variant: "screen" | "print"): CSSProperties => ({
  display: "grid",
  gridTemplateColumns:
    variant === "print"
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(auto-fill, minmax(170px, 1fr))",
  gap: "var(--mantine-spacing-sm)",
  alignItems: "start",
});

export const WeekView = ({ model, variant }: WeekViewProps) => {
  const { t } = useTranslation("share");
  const { snapshot, include } = model;
  const hasWeekNote = include.note && model.snapshot.weekNote.trim().length > 0;
  const hasHabits = include.habits && snapshot.habits.length > 0;
  const showWeekDecor = variant === "screen" && include.decorations;

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        {model.notebookName && (
          <Text ff="var(--sw-font-hand)" fz={28} fw={600} c="var(--sw-ink-2)">
            {model.notebookName}
          </Text>
        )}
        <Text
          component={variant === "screen" ? "h1" : "p"}
          fz="xl"
          fw={700}
          c="var(--sw-ink)"
        >
          {model.weekTitle}
        </Text>
      </Stack>

      <Box style={{ position: "relative" }}>
        <div style={gridStyle(variant)}>
          {snapshot.days.map((day) => (
            <StaticDayCard
              key={day.iso}
              day={day}
              include={include}
              trackers={snapshot.trackers}
              trackerValues={snapshot.trackerValues}
              decorations={snapshot.decorations}
            />
          ))}
        </div>
        {showWeekDecor && (
          <StaticDecorations decorations={snapshot.decorations} target="week" />
        )}
      </Box>

      {hasWeekNote && (
        <Box
          className="sw-break-avoid"
          style={{
            backgroundColor: "var(--sw-paper-2)",
            border: "1px solid var(--sw-line)",
            borderRadius: "var(--mantine-radius-lg)",
            padding: "var(--mantine-spacing-md)",
          }}
        >
          <Text
            ff="var(--sw-font-hand)"
            fz="1.25rem"
            c="var(--sw-ink-2)"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {snapshot.weekNote}
          </Text>
        </Box>
      )}

      {hasHabits && (
        <Box
          className="sw-break-avoid"
          style={{ ...cardSurface("lg"), padding: "var(--mantine-spacing-md)" }}
        >
          <Text fz="sm" fw={700} c="var(--sw-ink-2)" mb="sm">
            {t("section.habits")}
          </Text>
          <StaticHabitGrid
            habits={snapshot.habits}
            checks={snapshot.habitChecks}
            days={snapshot.days}
          />
        </Box>
      )}
    </Stack>
  );
};
