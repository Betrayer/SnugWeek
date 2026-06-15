import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, m } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { useUiStore } from "../../../state/uiStore.ts";
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
}: TaskListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const reduced = useReducedMotionPref();
  const tagFilter = useUiStore((state) => state.tagFilter);
  const sorted = sortForDisplay(tasks);
  const filtering = tagFilter.length > 0;
  const display = filtering
    ? sorted.filter((task) =>
      task.tagIds.some((id) => tagFilter.includes(id)),
    )
    : sorted;

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
                onOpen={() => useUiStore.getState().openTask(task.id)}
              />
            </m.div>
          ))}
        </AnimatePresence>
        {display.length === 0 && emptyLabel && !filtering && (
          <EmptyState icon={emptyIcon ?? <SparkleDoodle />} label={emptyLabel} />
        )}
      </div>
    </SortableContext>
  );
};
