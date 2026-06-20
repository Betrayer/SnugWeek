import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface TourState {
  running: boolean;
  stepIndex: number;
  start: () => void;
  stop: () => void;
  setStepIndex: (stepIndex: number) => void;
}

export const useTourStore = create<TourState>()(
  devtools(
    (set) => ({
      running: false,
      stepIndex: 0,
      start: () => set({ running: true, stepIndex: 0 }),
      stop: () => set({ running: false, stepIndex: 0 }),
      setStepIndex: (stepIndex) => set({ stepIndex }),
    }),
    { name: "tourStore" },
  ),
);
