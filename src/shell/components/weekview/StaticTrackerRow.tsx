import { Group } from "@mantine/core";
import type {
  ShareSnapshot,
  WeekViewTracker,
} from "../../../services/share/shareTypes.ts";
import type { TrackerValue } from "../../../services/repos/weeksRepo.ts";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";

interface StaticTrackerRowProps {
  trackers: WeekViewTracker[];
  values: ShareSnapshot["trackerValues"][string] | undefined;
}

const Scale5 = ({ value }: { value: number }) => (
  <Group gap={3} wrap="nowrap">
    {[1, 2, 3, 4, 5].map((level) => (
      <span
        key={level}
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          border: `1.5px solid ${level <= value ? "var(--sw-accent)" : "var(--sw-line)"}`,
          backgroundColor: level <= value ? "var(--sw-accent)" : "transparent",
        }}
      />
    ))}
  </Group>
);

const TrackerValueView = ({
  tracker,
  value,
}: {
  tracker: WeekViewTracker;
  value: TrackerValue;
}) => {
  if (tracker.type === "emoji") {
    return typeof value === "string" ? (
      <span style={{ fontSize: 16, lineHeight: 1 }}>{value}</span>
    ) : null;
  }
  if (tracker.type === "scale5") {
    return (
      <Group gap={5} wrap="nowrap">
        <TrackerIcon icon={tracker.icon} size={14} color="var(--sw-ink-3)" />
        <Scale5 value={typeof value === "number" ? value : 0} />
      </Group>
    );
  }
  if (tracker.type === "number") {
    return (
      <Group gap={3} wrap="nowrap" style={{ color: "var(--sw-ink-2)" }}>
        <TrackerIcon icon={tracker.icon} size={14} color="var(--sw-ink-3)" />
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          {typeof value === "number" ? value : 0}
        </span>
      </Group>
    );
  }
  return value === true ? (
    <Group gap={4} wrap="nowrap" style={{ color: "var(--sw-done)" }}>
      <TrackerIcon icon={tracker.icon} size={14} color="var(--sw-done)" />
    </Group>
  ) : null;
};

export const StaticTrackerRow = ({ trackers, values }: StaticTrackerRowProps) => {
  if (!values) return null;
  const shown = trackers.filter((tracker) => values[tracker.id] !== undefined);
  if (shown.length === 0) return null;
  return (
    <Group gap={12} wrap="wrap" align="center" style={{ rowGap: 6 }}>
      {shown.map((tracker) => (
        <TrackerValueView
          key={tracker.id}
          tracker={tracker}
          value={values[tracker.id] as TrackerValue}
        />
      ))}
    </Group>
  );
};
