import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { RoutineAdherenceDatum } from "../../../services/stats/routineAdherence.ts";

interface RoutineAdherenceListProps {
  data: RoutineAdherenceDatum[];
}

export const RoutineAdherenceList = ({ data }: RoutineAdherenceListProps) => {
  const { t } = useTranslation("stats");
  return (
    <Stack gap={10}>
      {data.map((routine) => {
        const pct = routine.rate === null ? 0 : Math.round(routine.rate * 100);
        return (
          <Stack key={routine.routineId} gap={3}>
            <Group justify="space-between" gap="sm" wrap="nowrap">
              <Text fz="sm" c="var(--sw-ink)" truncate style={{ minWidth: 0 }}>
                {routine.title}
              </Text>
              <Text fz="xs" c="var(--sw-ink-2)" style={{ flexShrink: 0 }}>
                {routine.rate === null
                  ? t("noData")
                  : t("adherenceCount", {
                      completed: routine.completed,
                      generated: routine.generated,
                    })}
              </Text>
            </Group>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "var(--sw-line)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: "var(--sw-accent)",
                  borderRadius: 4,
                }}
              />
            </div>
          </Stack>
        );
      })}
    </Stack>
  );
};
