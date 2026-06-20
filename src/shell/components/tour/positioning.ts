import type { TourPlacement } from "../../../data/tourSteps.ts";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CalloutPosition {
  top: number;
  left: number;
  placement: TourPlacement;
}

const GAP = 14;
const MARGIN = 12;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const opposite: Record<TourPlacement, TourPlacement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
  center: "center",
};

const fits = (
  placement: TourPlacement,
  target: Rect,
  card: { width: number; height: number },
  viewport: { width: number; height: number },
): boolean => {
  if (placement === "top") return target.top - GAP - card.height >= MARGIN;
  if (placement === "bottom")
    return target.top + target.height + GAP + card.height <= viewport.height - MARGIN;
  if (placement === "left") return target.left - GAP - card.width >= MARGIN;
  if (placement === "right")
    return target.left + target.width + GAP + card.width <= viewport.width - MARGIN;
  return true;
};

export const computeCalloutPosition = (
  target: Rect | null,
  card: { width: number; height: number },
  preferred: TourPlacement,
  viewport: { width: number; height: number },
): CalloutPosition => {
  if (!target || preferred === "center") {
    return {
      top: Math.max(MARGIN, (viewport.height - card.height) / 2),
      left: clamp(
        (viewport.width - card.width) / 2,
        MARGIN,
        viewport.width - card.width - MARGIN,
      ),
      placement: "center",
    };
  }

  let placement: TourPlacement = preferred;
  if (!fits(placement, target, card, viewport)) {
    const flipped = opposite[placement];
    if (fits(flipped, target, card, viewport)) placement = flipped;
  }

  let top: number;
  let left: number;
  if (placement === "top") {
    top = target.top - GAP - card.height;
    left = target.left + target.width / 2 - card.width / 2;
  } else if (placement === "bottom") {
    top = target.top + target.height + GAP;
    left = target.left + target.width / 2 - card.width / 2;
  } else if (placement === "left") {
    left = target.left - GAP - card.width;
    top = target.top + target.height / 2 - card.height / 2;
  } else {
    left = target.left + target.width + GAP;
    top = target.top + target.height / 2 - card.height / 2;
  }

  return {
    top: clamp(top, MARGIN, Math.max(MARGIN, viewport.height - card.height - MARGIN)),
    left: clamp(left, MARGIN, Math.max(MARGIN, viewport.width - card.width - MARGIN)),
    placement,
  };
};
