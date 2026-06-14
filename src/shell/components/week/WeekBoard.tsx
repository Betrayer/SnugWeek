import { motion } from "motion/react";
import type { Variants } from "motion/react";
import type { CSSProperties } from "react";
import type { WeekDay } from "../../../services/time.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { DayColumn } from "./DayColumn.tsx";
import { WeekendStack } from "./WeekendStack.tsx";

interface WeekBoardProps {
  days: WeekDay[];
  daysOff: number[];
  columnMode: "cozy" | "equal";
}

const container: Variants = {
  animate: { transition: { staggerChildren: 0.02 } },
};

const item: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
};

const cellStyle: CSSProperties = {
  minHeight: 0,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
};

const gridStyle = (columns: string): CSSProperties => ({
  flex: 1,
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: columns,
  gridTemplateRows: "minmax(0, 1fr)",
  gap: "var(--mantine-spacing-md)",
});

export const WeekBoard = ({ days, daysOff, columnMode }: WeekBoardProps) => {
  const reduced = useReducedMotionPref();
  const initial = reduced ? false : "initial";

  if (columnMode === "equal") {
    return (
      <motion.div
        style={gridStyle("repeat(7, 1fr)")}
        variants={container}
        initial={initial}
        animate="animate"
      >
        {days.map((day) => (
          <motion.div key={day.iso} variants={item} style={cellStyle}>
            <DayColumn day={day} isOff={daysOff.includes(day.iso)} />
          </motion.div>
        ))}
      </motion.div>
    );
  }
  const weekdays = days.slice(0, 5);
  const weekendDays = days.slice(5);
  return (
    <motion.div
      style={gridStyle("repeat(5, 1fr) 0.72fr")}
      variants={container}
      initial={initial}
      animate="animate"
    >
      {weekdays.map((day) => (
        <motion.div key={day.iso} variants={item} style={cellStyle}>
          <DayColumn day={day} isOff={daysOff.includes(day.iso)} />
        </motion.div>
      ))}
      <motion.div variants={item} style={cellStyle}>
        <WeekendStack days={weekendDays} daysOff={daysOff} />
      </motion.div>
    </motion.div>
  );
};
