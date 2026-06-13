import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Text } from "@mantine/core";
import type { CSSProperties } from "react";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { SortableTaskCard } from "./SortableTaskCard.tsx";
import { sortForDisplay } from "./taskSort.ts";

interface TaskListProps {
  tasks: Task[];
  containerId: string;
  emptyLabel?: string;
  fill?: boolean;
  onToggle: (task: Task) => void;
  onRename: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
  onMove?: (task: Task) => void;
}

const zoneStyle = (isOver: boolean, fill: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: fill ? 1 : undefined,
  minHeight: fill ? 0 : 44,
  overflowY: fill ? "auto" : "visible",
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: isOver
    ? "color-mix(in srgb, var(--sw-accent) 8%, transparent)"
    : "transparent",
  transition: "background-color 120ms ease",
});

export const TaskList = ({
  tasks,
  containerId,
  emptyLabel,
  fill = false,
  onToggle,
  onRename,
  onDelete,
  onMove,
}: TaskListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const display = sortForDisplay(tasks);

  return (
    <SortableContext
      id={containerId}
      items={display.map((task) => task.id)}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} style={zoneStyle(isOver, fill)}>
        {display.map((task) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            onToggle={() => onToggle(task)}
            onRename={(title) => onRename(task.id, title)}
            onDelete={() => onDelete(task.id)}
            onMove={onMove ? () => onMove(task) : undefined}
          />
        ))}
        {display.length === 0 && emptyLabel && (
          <div
            style={{
              flex: fill ? 1 : undefined,
              minHeight: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text ff="var(--sw-font-hand)" fz="lg" c="var(--sw-ink-3)">
              {emptyLabel}
            </Text>
          </div>
        )}
      </div>
    </SortableContext>
  );
};
