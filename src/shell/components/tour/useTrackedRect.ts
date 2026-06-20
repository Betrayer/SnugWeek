import { useEffect, useState } from "react";
import { firstVisibleMatch } from "./tourTarget.ts";
import type { Rect } from "./positioning.ts";

interface TrackedRect {
  rect: Rect | null;
  missing: boolean;
}

const EMPTY: TrackedRect = { rect: null, missing: false };

export const useTrackedRect = (
  selector: string | null,
  active: boolean,
): TrackedRect => {
  const [state, setState] = useState<TrackedRect>(EMPTY);

  useEffect(() => {
    if (!active || !selector) {
      const reset = requestAnimationFrame(() => setState(EMPTY));
      return () => cancelAnimationFrame(reset);
    }
    let frame = 0;
    let signature = "";
    const tick = () => {
      const element = firstVisibleMatch(selector);
      if (element) {
        const box = element.getBoundingClientRect();
        const next = `${box.top}|${box.left}|${box.width}|${box.height}`;
        if (next !== signature) {
          signature = next;
          setState({
            rect: {
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
            },
            missing: false,
          });
        }
      } else if (signature !== "missing") {
        signature = "missing";
        setState({ rect: null, missing: true });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [selector, active]);

  return state;
};
