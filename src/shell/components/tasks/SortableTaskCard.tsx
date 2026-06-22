import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { TaskCard } from "./TaskCard.tsx";

interface SortableTaskCardProps {
  task: Task;
  onToggle: () => void;
  onOpen: () => void;
  onRename?: (title: string) => void;
  onDelete?: () => void;
}

export const SortableTaskCard = ({
  task,
  onToggle,
  onOpen,
  onRename,
  onDelete,
}: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: task.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {isOver && !isDragging && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -1,
            insetInline: 4,
            height: 2,
            borderRadius: 2,
            backgroundColor: "var(--sw-accent)",
          }}
        />
      )}
      <TaskCard
        task={task}
        onToggle={onToggle}
        onOpen={onOpen}
        onRename={onRename}
        onDelete={onDelete}
      />
    </div>
  );
};
