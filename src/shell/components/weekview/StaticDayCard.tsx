import { Box, Stack, Text } from "@mantine/core";
import type {
  ShareInclude,
  ShareSnapshot,
  WeekViewDay,
  WeekViewTracker,
} from "../../../services/share/shareTypes.ts";
import type { Decoration } from "../../../services/repos/weeksRepo.ts";
import { StaticDecorations } from "./StaticDecorations.tsx";
import { StaticTaskRow } from "./StaticTaskRow.tsx";
import { StaticTrackerRow } from "./StaticTrackerRow.tsx";

interface StaticDayCardProps {
  day: WeekViewDay;
  include: ShareInclude;
  trackers: WeekViewTracker[];
  trackerValues: ShareSnapshot["trackerValues"];
  decorations: Decoration[];
}

export const StaticDayCard = ({
  day,
  include,
  trackers,
  trackerValues,
  decorations,
}: StaticDayCardProps) => (
  <Box
    className="sw-break-avoid"
    style={{
      position: "relative",
      backgroundColor: day.isOff ? "var(--sw-paper-2)" : "var(--sw-card)",
      border: "1px solid var(--sw-line)",
      borderRadius: "var(--mantine-radius-lg)",
      padding: "var(--mantine-spacing-sm)",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <Text fw={700} fz="sm" c={day.isOff ? "var(--sw-ink-3)" : "var(--sw-ink)"}>
      {day.label}
    </Text>
    {include.trackers && (
      <StaticTrackerRow trackers={trackers} values={trackerValues[String(day.iso)]} />
    )}
    <Stack gap={0}>
      {day.tasks.map((task) => (
        <StaticTaskRow key={task.id} task={task} />
      ))}
    </Stack>
    {include.note && day.note.trim().length > 0 && (
      <Text
        ff="var(--sw-font-hand)"
        fz="1.1rem"
        c="var(--sw-ink-2)"
        style={{
          whiteSpace: "pre-wrap",
          borderTop: "1px dashed var(--sw-line)",
          paddingBlockStart: 4,
        }}
      >
        {day.note}
      </Text>
    )}
    {include.decorations && (
      <StaticDecorations decorations={decorations} target={day.iso} />
    )}
  </Box>
);
