import { Group, Stack, Text } from "@mantine/core";
import type { TagDatum } from "../../../services/stats/taskAnalytics.ts";

interface TagBreakdownListProps {
  data: TagDatum[];
}

export const TagBreakdownList = ({ data }: TagBreakdownListProps) => {
  const max = Math.max(1, ...data.map((datum) => datum.count));
  return (
    <Stack gap={8}>
      {data.map((tag) => (
        <Group key={tag.id} gap="sm" wrap="nowrap">
          <Text
            fz="sm"
            c="var(--sw-ink)"
            truncate
            style={{ width: 92, flexShrink: 0 }}
          >
            {tag.name}
          </Text>
          <div
            style={{
              flex: 1,
              height: 12,
              borderRadius: 6,
              backgroundColor: "var(--sw-line)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(tag.count / max) * 100}%`,
                height: "100%",
                backgroundColor: tag.color,
                borderRadius: 6,
              }}
            />
          </div>
          <Text
            fz="xs"
            c="var(--sw-ink-3)"
            style={{ width: 24, textAlign: "right", flexShrink: 0 }}
          >
            {tag.count}
          </Text>
        </Group>
      ))}
    </Stack>
  );
};
