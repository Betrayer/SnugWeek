import { useEffect } from "react";
import { createPortal } from "react-dom";
import { TOUR_STEPS } from "../../../data/tourSteps.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useTourStore } from "../../../state/tourStore.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { SpotlightOverlay } from "./SpotlightOverlay.tsx";
import { TourBubble } from "./TourBubble.tsx";
import { useTrackedRect } from "./useTrackedRect.ts";

const MISSING_SKIP_MS = 700;
const TOTAL = TOUR_STEPS.length;

const finishTour = (): void => {
  useSettingsStore.getState().setTourSeen(true);
  useTourStore.getState().stop();
};

const advance = (): void => {
  const { stepIndex } = useTourStore.getState();
  if (stepIndex >= TOTAL - 1) finishTour();
  else useTourStore.getState().setStepIndex(stepIndex + 1);
};

const retreat = (): void => {
  const { stepIndex } = useTourStore.getState();
  if (stepIndex > 0) useTourStore.getState().setStepIndex(stepIndex - 1);
};

export const TourHost = () => {
  const running = useTourStore((state) => state.running);
  const stepIndex = useTourStore((state) => state.stepIndex);
  const reduced = useReducedMotionPref();

  const step = TOUR_STEPS[Math.min(stepIndex, TOTAL - 1)];
  const selector = running && step?.anchor ? `[data-tour="${step.anchor}"]` : null;
  const { rect, missing } = useTrackedRect(selector, running);

  useEffect(() => {
    if (!running || !selector || !missing) return;
    const timer = window.setTimeout(advance, MISSING_SKIP_MS);
    return () => window.clearTimeout(timer);
  }, [running, selector, missing]);

  useEffect(() => {
    if (!running) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishTour();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        advance();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        retreat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  if (!running || !step) return null;

  return createPortal(
    <>
      <SpotlightOverlay rect={rect} reduced={reduced} onClickOutside={finishTour} />
      <TourBubble
        key={step.id}
        step={step}
        index={stepIndex}
        total={TOTAL}
        rect={rect}
        reduced={reduced}
        onBack={retreat}
        onNext={advance}
        onSkip={finishTour}
      />
    </>,
    document.body,
  );
};
