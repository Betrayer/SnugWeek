import { UnstyledButton } from "@mantine/core";
import type { CSSProperties } from "react";
import type { TrackerCellState } from "../../../services/month/monthTracker.ts";

interface MonthTrackerCellProps {
  state: TrackerCellState | undefined;
  color: string;
  isToday: boolean;
  isWeekend: boolean;
  label: string;
  onOpen: () => void;
}

const crossHatch = (color: string): CSSProperties => ({
  backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
  backgroundImage: [
    `repeating-linear-gradient(45deg, ${color} 0 1.3px, transparent 1.3px 6px)`,
    `repeating-linear-gradient(-45deg, ${color} 0 1.3px, transparent 1.3px 6px)`,
  ].join(", "),
});

const sparseHatch = (color: string): CSSProperties => ({
  backgroundColor: `color-mix(in srgb, ${color} 7%, transparent)`,
  backgroundImage: `repeating-linear-gradient(45deg, color-mix(in srgb, ${color} 60%, transparent) 0 1px, transparent 1px 8px)`,
});

const fillStyle = (
  state: TrackerCellState | undefined,
  color: string,
): CSSProperties => {
  if (state === "full") return crossHatch(color);
  if (state === "light") return sparseHatch(color);
  return {};
};

export const MonthTrackerCell = ({
  state,
  color,
  isToday,
  isWeekend,
  label,
  onOpen,
}: MonthTrackerCellProps) => (
  <UnstyledButton
    onClick={onOpen}
    aria-label={label}
    style={{
      height: 32,
      display: "flex",
      borderInlineEnd: "1px solid var(--sw-line)",
      borderBottom: "1px solid var(--sw-line)",
      backgroundColor: isToday
        ? "color-mix(in srgb, var(--sw-accent) 8%, transparent)"
        : isWeekend
          ? "color-mix(in srgb, var(--sw-paper-2) 60%, transparent)"
          : "transparent",
    }}
  >
    <span style={{ flex: 1, ...fillStyle(state, color) }} />
  </UnstyledButton>
);
