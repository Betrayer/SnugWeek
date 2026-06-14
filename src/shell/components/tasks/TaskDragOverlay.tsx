import { DragOverlay } from "@dnd-kit/core";
import { m } from "motion/react";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { TaskCard } from "./TaskCard.tsx";

interface TaskDragOverlayProps {
  task: Task | null;
  list: { name: string } | null;
}

const noop = () => {};

export const TaskDragOverlay = ({ task, list }: TaskDragOverlayProps) => {
  const reduced = useReducedMotionPref();
  const liftTarget = reduced
    ? { scale: 1, rotate: 0 }
    : { scale: 1.03, rotate: 2 };
  const lift = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 30 };

  return (
    <DragOverlay dropAnimation={null}>
      {task ? (
        <m.div
          initial={reduced ? false : { scale: 1, rotate: 0 }}
          animate={liftTarget}
          transition={lift}
          style={{
            cursor: "grabbing",
            filter: "drop-shadow(0 8px 18px var(--sw-fold-shade))",
          }}
        >
          <TaskCard
            task={task}
            isOverlay
            onToggle={noop}
            onRename={noop}
            onDelete={noop}
          />
        </m.div>
      ) : list ? (
        <m.div
          initial={reduced ? false : { scale: 1, rotate: 0 }}
          animate={liftTarget}
          transition={lift}
          style={{
            cursor: "grabbing",
            padding: "6px 12px",
            borderRadius: "var(--mantine-radius-md)",
            backgroundColor: "var(--sw-card)",
            border: "1px solid var(--sw-line)",
            filter: "drop-shadow(0 8px 18px var(--sw-fold-shade))",
            fontFamily: "var(--sw-font-hand)",
            fontSize: 20,
            color: "var(--sw-ink-2)",
            whiteSpace: "nowrap",
          }}
        >
          {list.name}
        </m.div>
      ) : null}
    </DragOverlay>
  );
};
