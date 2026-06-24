import { Group, Stack, Text } from "@mantine/core";
import type { TrackerAverage } from "../../../services/stats/trackerStats.ts";

interface TrackerAveragesProps {
  data: TrackerAverage[];
}

export const TrackerAverages = ({ data }: TrackerAveragesProps) => (
  <Stack gap={8}>
    {data.map((tracker) => (
      <Group key={tracker.id} justify="space-between" wrap="nowrap" gap="sm">
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: tracker.color,
              flexShrink: 0,
            }}
          />
          <Text fz="sm" c="var(--sw-ink)" truncate>
            {tracker.name}
          </Text>
        </Group>
        <Text fz="sm" fw={700} c="var(--sw-ink-2)" style={{ flexShrink: 0 }}>
          {tracker.avg.toFixed(1)}
        </Text>
      </Group>
    ))}
  </Stack>
);
