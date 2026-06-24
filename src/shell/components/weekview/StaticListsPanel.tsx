import { Box, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { WeekViewList } from "../../../services/share/shareTypes.ts";
import { cardSurface } from "../../styles/surfaces.ts";
import { StaticTaskRow } from "./StaticTaskRow.tsx";

interface StaticListsPanelProps {
  lists: WeekViewList[];
}

export const StaticListsPanel = ({ lists }: StaticListsPanelProps) => {
  const { t } = useTranslation(["share", "tasks"]);
  return (
    <Stack gap="md">
      {lists.map((list) => (
        <Box
          key={list.id}
          className="sw-break-avoid"
          style={{ ...cardSurface("lg"), padding: "var(--mantine-spacing-md)" }}
        >
          <Text fz="sm" fw={700} c="var(--sw-ink-2)" mb="xs">
            {list.emoji ? `${list.emoji} ` : ""}
            {list.name ?? t(`tasks:lists.${list.kind}`)}
          </Text>
          <Stack gap={0}>
            {list.tasks.map((task) => (
              <StaticTaskRow key={task.id} task={task} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};
