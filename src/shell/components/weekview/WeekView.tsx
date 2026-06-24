import { Box, Stack, Text } from "@mantine/core";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { WeekViewModel } from "../../../services/share/shareTypes.ts";
import { StaticDayCard } from "./StaticDayCard.tsx";
import { StaticDecorations } from "./StaticDecorations.tsx";
import { StaticHabitGrid } from "./StaticHabitGrid.tsx";
import { StaticListsPanel } from "./StaticListsPanel.tsx";
import { cardSurface } from "../../styles/surfaces.ts";

interface WeekViewProps {
  model: WeekViewModel;
  variant: "screen" | "print";
}

const printGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "var(--mantine-spacing-sm)",
  alignItems: "start",
};

export const WeekView = ({ model, variant }: WeekViewProps) => {
  const { t } = useTranslation("share");
  const { snapshot, include } = model;
  const hasWeekNote = include.note && model.snapshot.weekNote.trim().length > 0;
  const hasHabits = include.habits && snapshot.habits.length > 0;
  const showWeekDecor = variant === "screen" && include.decorations;
  const showLists =
    variant === "screen" && include.lists && snapshot.lists.length > 0;

  const dayCards = snapshot.days.map((day) => (
    <StaticDayCard
      key={day.iso}
      day={day}
      include={include}
      trackers={snapshot.trackers}
      trackerValues={snapshot.trackerValues}
      decorations={snapshot.decorations}
    />
  ));

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

      <Box
        style={{
          display: "flex",
          gap: "var(--mantine-spacing-md)",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Box style={{ flex: "4 1 480px", minWidth: 0, position: "relative" }}>
          {variant === "print" ? (
            <div style={printGridStyle}>{dayCards}</div>
          ) : (
            <div className="sw-week-grid">{dayCards}</div>
          )}
          {showWeekDecor && (
            <StaticDecorations decorations={snapshot.decorations} target="week" />
          )}
        </Box>
        {showLists && (
          <Box style={{ flex: "1 1 240px", minWidth: 0, maxWidth: 340 }}>
            <StaticListsPanel lists={snapshot.lists} />
          </Box>
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
