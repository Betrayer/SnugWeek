import { UnstyledButton } from "@mantine/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

interface SortableItemProps {
  id: string;
  handleLabel: string;
  children: ReactNode;
}

const GripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </svg>
);

export const SortableItem = ({ id, handleLabel, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <UnstyledButton
        ref={setActivatorNodeRef}
        aria-label={handleLabel}
        style={{
          flex: "0 0 auto",
          color: "var(--sw-ink-3)",
          cursor: "grab",
          touchAction: "none",
          display: "inline-flex",
        }}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </UnstyledButton>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
};
