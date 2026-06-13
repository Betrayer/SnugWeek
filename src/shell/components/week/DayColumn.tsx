import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import type { WeekDay } from "../../../services/time.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { dayContainerId } from "../tasks/dndIds.ts";
import { TaskComposer } from "../tasks/TaskComposer.tsx";
import { TaskList } from "../tasks/TaskList.tsx";
import { DayHeader } from "./DayHeader.tsx";

interface DayColumnProps {
  day: WeekDay;
  isOff: boolean;
}

const EMPTY: Task[] = [];

export const DayColumn = ({ day, isOff }: DayColumnProps) => {
  const { t } = useTranslation("tasks");
  const tasks = useWeekStore((state) => state.tasksByDay[day.iso] ?? EMPTY);

  return (
    <Stack
      gap="xs"
      style={{
        backgroundColor: isOff ? "var(--sw-paper-2)" : "var(--sw-card)",
        border: "1px solid var(--sw-line)",
        borderRadius: "var(--mantine-radius-lg)",
        padding: "var(--mantine-spacing-sm)",
        boxShadow: "var(--sw-shadow)",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <DayHeader day={day} isOff={isOff} />
      <TaskList
        tasks={tasks}
        containerId={dayContainerId(day.iso)}
        emptyLabel={t("emptyDay")}
        fill
        onToggle={(task) => useWeekStore.getState().toggleDone(task)}
        onRename={(id, title) => useWeekStore.getState().renameTask(id, title)}
        onDelete={(id) => useWeekStore.getState().removeTask(id)}
        onMove={(task) => useUiStore.getState().openMove(task)}
      />
      <TaskComposer
        onAdd={(title) => useWeekStore.getState().addTask(day.iso, title)}
      />
    </Stack>
  );
};
