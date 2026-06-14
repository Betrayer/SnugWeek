import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, m } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { EmptyState } from "../common/EmptyState.tsx";
import { SparkleDoodle } from "../common/doodles.tsx";
import { SortableTaskCard } from "./SortableTaskCard.tsx";
import { sortForDisplay } from "./taskSort.ts";

interface TaskListProps {
  tasks: Task[];
  containerId: string;
  emptyLabel?: string;
  emptyIcon?: ReactNode;
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
  emptyIcon,
  fill = false,
  onToggle,
  onRename,
  onDelete,
  onMove,
}: TaskListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const reduced = useReducedMotionPref();
  const display = sortForDisplay(tasks);

  return (
    <SortableContext
      id={containerId}
      items={display.map((task) => task.id)}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} style={zoneStyle(isOver, fill)}>
        <AnimatePresence initial={false}>
          {display.map((task) => (
            <m.div
              key={task.id}
              style={{ overflow: "hidden" }}
              initial={reduced ? false : { opacity: 0, height: 0, scale: 0.96 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }
              }
            >
              <SortableTaskCard
                task={task}
                onToggle={() => onToggle(task)}
                onRename={(title) => onRename(task.id, title)}
                onDelete={() => onDelete(task.id)}
                onMove={onMove ? () => onMove(task) : undefined}
              />
            </m.div>
          ))}
        </AnimatePresence>
        {display.length === 0 && emptyLabel && (
          <EmptyState icon={emptyIcon ?? <SparkleDoodle />} label={emptyLabel} />
        )}
      </div>
    </SortableContext>
  );
};
