import { useReducedMotion } from "motion/react";
import { useSettingsStore } from "../../state/settingsStore.ts";

export const useReducedMotionPref = (): boolean => {
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const prefersReduced = useReducedMotion();
  return reduceMotion || prefersReduced === true;
};
