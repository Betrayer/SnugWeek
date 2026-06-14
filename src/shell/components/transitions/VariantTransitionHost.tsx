import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { VariantTransition } from "./transitions.ts";

interface VariantTransitionHostProps {
  weekId: string;
  transition: VariantTransition;
  children: ReactNode;
}

const shade = (direction: number): string =>
  direction > 0
    ? "linear-gradient(to right, var(--sw-fold-shade), transparent 58%)"
    : "linear-gradient(to left, var(--sw-fold-shade), transparent 58%)";

export const VariantTransitionHost = ({
  weekId,
  transition,
  children,
}: VariantTransitionHostProps) => {
  const [shown, setShown] = useState<{ weekId: string; direction: number }>({
    weekId,
    direction: 1,
  });
  if (weekId !== shown.weekId) {
    setShown({ weekId, direction: weekId > shown.weekId ? 1 : -1 });
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        perspective: transition.perspective
          ? `${transition.perspective}px`
          : undefined,
      }}
    >
      <AnimatePresence custom={shown.direction} initial={false}>
        <motion.div
          key={shown.weekId}
          custom={shown.direction}
          variants={transition.page}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backfaceVisibility: "hidden",
          }}
        >
          {children}
          {transition.overlay && (
            <motion.div
              aria-hidden
              variants={transition.overlay}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                borderRadius: "var(--mantine-radius-lg)",
                backgroundImage: shade(shown.direction),
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
