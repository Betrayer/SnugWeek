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

const fillStyle = (
  state: TrackerCellState | undefined,
  color: string,
): CSSProperties => {
  if (state === "full") {
    return { backgroundColor: color, border: `1px solid ${color}` };
  }
  if (state === "light") {
    return {
      backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
      backgroundImage: `repeating-linear-gradient(45deg, color-mix(in srgb, ${color} 32%, transparent) 0 1.5px, transparent 1.5px 5px)`,
    };
  }
  return { backgroundColor: "transparent", border: "1px solid transparent" };
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
      height: 30,
      padding: 3,
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
    <span style={{ flex: 1, borderRadius: 5, ...fillStyle(state, color) }} />
  </UnstyledButton>
);
