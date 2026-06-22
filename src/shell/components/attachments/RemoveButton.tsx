import { UnstyledButton } from "@mantine/core";
import type { MouseEvent } from "react";
import { TrashGlyph } from "../icons/glyphs.tsx";

interface RemoveButtonProps {
  onRemove: () => void;
  label: string;
  overlay?: boolean;
}

export const RemoveButton = ({ onRemove, label, overlay }: RemoveButtonProps) => (
  <UnstyledButton
    aria-label={label}
    onClick={(event: MouseEvent) => {
      event.stopPropagation();
      onRemove();
    }}
    style={{
      width: 28,
      height: 28,
      flex: "0 0 auto",
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--sw-ink-2)",
      backgroundColor: overlay ? "var(--sw-card)" : "transparent",
      boxShadow: overlay ? "var(--sw-shadow)" : "none",
      ...(overlay ? { position: "absolute", top: 6, right: 6 } : {}),
    }}
  >
    <TrashGlyph size={15} />
  </UnstyledButton>
);
