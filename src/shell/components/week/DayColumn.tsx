import { useDroppable } from "@dnd-kit/core";
import { Stack } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import type { WeekDay } from "../../../services/time.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { AttachmentsArea } from "../attachments/AttachmentsArea.tsx";
import { MemoriesStrip } from "../attachments/MemoriesStrip.tsx";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { DecorationLayer } from "../decor/DecorationLayer.tsx";
import { DayHabitRow } from "../habits/DayHabitRow.tsx";
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
  const { t } = useTranslation(["tasks", "attachments"]);
  const tasks = useWeekStore((state) => state.tasksByDay[day.iso] ?? EMPTY);
  const weekId = useWeekStore((state) => state.weekId);
  const lists = useListsStore((state) => state.lists);
  const showTrackers = useProfileStore(
    (state) => state.moduleToggles.dayTrackers,
  );
  const showHabits = useProfileStore((state) => state.moduleToggles.habits);
  const showNote = useProfileStore((state) => state.moduleToggles.weekNote);
  const [memoriesOpen, setMemoriesOpen] = useState(false);
  const [composerActive, setComposerActive] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: dayColumnId(day.iso) });
  const dayLists = lists.filter(
    (list) => list.kind === "custom" && list.day === day.iso,
  );

  const borderColor = isOver
    ? "var(--sw-accent)"
    : "color-mix(in srgb, var(--sw-line) 70%, transparent)";

  return (
    <Stack
      ref={setNodeRef}
      gap="xs"
      style={{
        position: "relative",
        backgroundColor: isOff
          ? "var(--sw-off-day, var(--sw-paper-2))"
          : "var(--sw-card)",
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
      <DayHeader
        day={day}
        isOff={isOff}
        onAdd={() => setComposerActive(true)}
        onAddMemory={weekId ? () => setMemoriesOpen(true) : undefined}
      />
      {showTrackers && <DayTrackerRow day={day.iso} />}
      {showHabits && <DayHabitRow day={day.iso} dayLabel={day.label} />}
      {weekId && (
        <MemoriesStrip
          weekId={weekId}
          day={day.iso}
          onOpen={() => setMemoriesOpen(true)}
        />
      )}
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
          emptyFill
          onToggle={(task) => useWeekStore.getState().toggleDone(task)}
          onRename={(task, title) =>
            useWeekStore.getState().renameTask(task.id, title)
          }
          onDelete={(task) => useWeekStore.getState().removeTask(task.id)}
        />
        <TaskComposer
          dataDay={day.iso}
          active={composerActive}
          onActiveChange={setComposerActive}
          onAdd={(title) => useWeekStore.getState().addTask(day.iso, title)}
        />
        {dayLists.map((list) => (
          <ListSection key={list.id} list={list} collapsible />
        ))}
      </div>
      {showNote && <DayNote day={day.iso} />}
      <DecorationLayer scope={day.iso} />
      {weekId && (
        <ResponsiveDialog
          opened={memoriesOpen}
          onClose={() => setMemoriesOpen(false)}
          title={t("attachments:memories")}
        >
          <AttachmentsArea scope="day" weekId={weekId} day={day.iso} />
        </ResponsiveDialog>
      )}
    </Stack>
  );
};
