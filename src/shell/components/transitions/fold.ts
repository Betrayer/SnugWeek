import type { Variants } from "motion/react";
import type { VariantTransition } from "./transitions.ts";

const DURATION = 0.45;
const EASE = [0.42, 0, 0.2, 1] as const;
const INSTANT = { duration: 0 };

const page: Variants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? 14 : -14,
    x: direction > 0 ? 26 : -26,
    opacity: 1,
    zIndex: 1,
    transformOrigin: direction > 0 ? "left center" : "right center",
  }),
  animate: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    zIndex: 1,
    transformOrigin: "center center",
    transition: { duration: DURATION, ease: EASE, zIndex: INSTANT },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -78 : 78,
    x: direction > 0 ? -46 : 46,
    opacity: 0,
    zIndex: 2,
    pointerEvents: "none",
    transformOrigin: direction > 0 ? "left center" : "right center",
    transition: { duration: DURATION, ease: EASE, zIndex: INSTANT },
  }),
};

const overlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 0, transition: { duration: DURATION } },
  exit: {
    opacity: [0, 0.34, 0.06],
    transition: { duration: DURATION, ease: EASE, times: [0, 0.55, 1] },
  },
};

export const foldTransition: VariantTransition = {
  id: "fold",
  kind: "variant",
  perspective: 2000,
  page,
  overlay,
};
