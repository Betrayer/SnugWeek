import { useRef } from "react";
import type { Decoration } from "../../../services/repos/weeksRepo.ts";
import { useDecorStore } from "../../../state/decorStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { DecorationItem } from "./DecorationItem.tsx";

interface DecorationLayerProps {
  scope: "week" | number;
}

const EMPTY: Decoration[] = [];

export const DecorationLayer = ({ scope }: DecorationLayerProps) => {
  const decorations = useWeekStore((state) => state.week?.decorations ?? EMPTY);
  const editMode = useDecorStore((state) => state.editMode);
  const selectedId = useDecorStore((state) => state.selectedId);
  const layerRef = useRef<HTMLDivElement>(null);

  const items = decorations.filter((item) => item.target === scope);
  if (items.length === 0) return null;

  return (
    <div
      ref={layerRef}
      aria-hidden={editMode ? undefined : true}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 4,
      }}
    >
      {items.map((item) => (
        <DecorationItem
          key={item.id}
          decoration={item}
          editMode={editMode}
          selected={editMode && selectedId === item.id}
          layerRef={layerRef}
        />
      ))}
    </div>
  );
};
