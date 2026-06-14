import type { Variants } from "motion/react";
import { foldTransition } from "./fold.ts";
import { noneTransition } from "./none.ts";

type TransitionId = "fold" | "none" | "curl";

export interface VariantTransition {
  id: "fold" | "none";
  kind: "variant";
  perspective: number;
  page: Variants;
  overlay: Variants | null;
}

interface CurlTransition {
  id: "curl";
  kind: "curl";
}

export type WeekTransition = VariantTransition | CurlTransition;

const curlTransition: CurlTransition = { id: "curl", kind: "curl" };

const TRANSITIONS: Record<TransitionId, WeekTransition> = {
  fold: foldTransition,
  none: noneTransition,
  curl: curlTransition,
};

export const resolveTransition = (
  setting: TransitionId,
  disabled: boolean,
): WeekTransition => (disabled ? TRANSITIONS.none : TRANSITIONS[setting]);
