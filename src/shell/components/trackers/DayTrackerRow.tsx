import { Group } from "@mantine/core";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
import type { TrackerValue } from "../../../services/repos/weeksRepo.ts";
import { useTrackersStore } from "../../../state/trackersStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { TrackerControl } from "./TrackerControl.tsx";

interface DayTrackerRowProps {
  day: number;
}

const EMPTY: Record<string, TrackerValue> = {};

export const DayTrackerRow = ({ day }: DayTrackerRowProps) => {
  const trackers = useTrackersStore((state) => state.trackers);
  const values = useWeekStore(
    (state) => state.week?.trackerValues[String(day)] ?? EMPTY,
  );
  const enabled = trackers.filter((tracker) => tracker.enabled);
  if (enabled.length === 0) return null;

  return (
    <Group
      gap={10}
      wrap="wrap"
      align="center"
      data-tour={TOUR_ANCHORS.trackers}
      style={{ rowGap: 6 }}
    >
      {enabled.map((tracker) => (
        <TrackerControl
          key={tracker.id}
          tracker={tracker}
          day={day}
          value={values[tracker.id]}
        />
      ))}
    </Group>
  );
};
