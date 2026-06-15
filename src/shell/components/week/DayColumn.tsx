import { useDroppable } from "@dnd-kit/core";
import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import type { WeekDay } from "../../../services/time.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { DayNote } from "../note/DayNote.tsx";
import { ListSection } from "../sidebar/ListSection.tsx";
import { dayColumnId, dayContainerId } from "../tasks/dndIds.ts";
import { DayTrackerRow } from "../trackers/DayTrackerRow.tsx";
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
  const lists = useListsStore((state) => state.lists);
  const showTrackers = useProfileStore(
    (state) => state.moduleToggles.dayTrackers,
  );
  const showNote = useProfileStore((state) => state.moduleToggles.weekNote);
  const { setNodeRef, isOver } = useDroppable({ id: dayColumnId(day.iso) });
  const dayLists = lists.filter(
    (list) => list.kind === "custom" && list.day === day.iso,
  );

  const borderColor = isOver ? "var(--sw-accent)" : "var(--sw-line)";

  return (
    <Stack
      ref={setNodeRef}
      gap="xs"
      style={{
        backgroundColor: isOff ? "var(--sw-paper-2)" : "var(--sw-card)",
        backgroundImage: "var(--sw-paper-texture)",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--mantine-radius-lg)",
        padding: "var(--mantine-spacing-sm)",
        boxShadow: "var(--sw-shadow)",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        transition: "border-color 120ms ease",
      }}
    >
      <DayHeader day={day} isOff={isOff} />
      {showTrackers && <DayTrackerRow day={day.iso} />}
      <div
        className="sw-hide-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        <TaskList
          tasks={tasks}
          containerId={dayContainerId(day.iso)}
          emptyLabel={t("emptyDay")}
          onToggle={(task) => useWeekStore.getState().toggleDone(task)}
        />
        <TaskComposer
          dataDay={day.iso}
          onAdd={(title) => useWeekStore.getState().addTask(day.iso, title)}
        />
        {dayLists.map((list) => (
          <ListSection key={list.id} list={list} collapsible />
        ))}
      </div>
      {showNote && <DayNote day={day.iso} />}
    </Stack>
  );
};
