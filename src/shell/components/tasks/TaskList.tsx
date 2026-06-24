import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, m } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
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
  emptyFill?: boolean;
  onToggle: (task: Task) => void;
  onRename?: (task: Task, title: string) => void;
  onDelete?: (task: Task) => void;
}

const zoneStyle = (
  isOver: boolean,
  fill: boolean,
  grow: boolean,
): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: fill || grow ? 1 : undefined,
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
  emptyFill = false,
  onToggle,
  onRename,
  onDelete,
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
  const showEmpty = display.length === 0 && !filtering;
  const grow = emptyFill && showEmpty && emptyLabel !== undefined;

  return (
    <SortableContext
      id={containerId}
      items={display.map((task) => task.id)}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} style={zoneStyle(isOver, fill, grow)}>
        <AnimatePresence initial={false}>
          {display.map((task, taskIndex) => (
            <m.div
              key={task.id}
              data-tour={taskIndex === 0 ? TOUR_ANCHORS.taskCard : undefined}
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
                onRename={
                  onRename ? (title) => onRename(task, title) : undefined
                }
                onDelete={onDelete ? () => onDelete(task) : undefined}
              />
            </m.div>
          ))}
        </AnimatePresence>
        {showEmpty &&
          emptyLabel !== undefined &&
          (grow ? (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EmptyState
                icon={emptyIcon ?? <SparkleDoodle />}
                label={emptyLabel}
              />
            </div>
          ) : (
            <EmptyState
              icon={emptyIcon ?? <SparkleDoodle />}
              label={emptyLabel}
            />
          ))}
      </div>
    </SortableContext>
  );
};
