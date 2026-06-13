import { DragOverlay } from "@dnd-kit/core";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { TaskCard } from "./TaskCard.tsx";

const noop = () => {};

export const TaskDragOverlay = ({ task }: { task: Task | null }) => (
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
    ) : null}
  </DragOverlay>
);
