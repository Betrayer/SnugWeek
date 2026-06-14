import type { Variants } from "motion/react";
import type { VariantTransition } from "./transitions.ts";

const page: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

export const noneTransition: VariantTransition = {
  id: "none",
  kind: "variant",
  perspective: 0,
  page,
  overlay: null,
};
