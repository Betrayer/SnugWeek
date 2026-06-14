import { DragOverlay } from "@dnd-kit/core";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { TaskCard } from "./TaskCard.tsx";

interface TaskDragOverlayProps {
  task: Task | null;
  list: { name: string } | null;
}

const noop = () => {};

export const TaskDragOverlay = ({ task, list }: TaskDragOverlayProps) => (
  <DragOverlay>
    {task ? (
      <div style={{ transform: "rotate(2deg) scale(1.02)", cursor: "grabbing" }}>
        <TaskCard
          task={task}
          isOverlay
          onToggle={noop}
          onRename={noop}
          onDelete={noop}
        />
      </div>
    ) : list ? (
      <div
        style={{
          transform: "rotate(2deg)",
          cursor: "grabbing",
          padding: "6px 12px",
          borderRadius: "var(--mantine-radius-md)",
          backgroundColor: "var(--sw-card)",
          border: "1px solid var(--sw-line)",
          boxShadow: "var(--sw-shadow)",
          fontFamily: "var(--sw-font-hand)",
          fontSize: 20,
          color: "var(--sw-ink-2)",
          whiteSpace: "nowrap",
        }}
      >
        {list.name}
      </div>
    ) : null}
  </DragOverlay>
);
