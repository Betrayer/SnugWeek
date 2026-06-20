import type { CSSProperties } from "react";
import type { Rect } from "./positioning.ts";

interface SpotlightOverlayProps {
  rect: Rect | null;
  reduced: boolean;
  onClickOutside: () => void;
}

const PAD = 8;
const Z = 9000;

export const SpotlightOverlay = ({
  rect,
  reduced,
  onClickOutside,
}: SpotlightOverlayProps) => {
  const containerStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: Z,
  };

  if (!rect) {
    return (
      <div
        aria-hidden
        style={{ ...containerStyle, backgroundColor: "var(--sw-scrim)" }}
        onClick={onClickOutside}
      />
    );
  }

  const cutoutStyle: CSSProperties = {
    position: "absolute",
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
    borderRadius: "var(--mantine-radius-lg)",
    boxShadow: "0 0 0 9999px var(--sw-scrim)",
    outline: "2px solid var(--sw-accent)",
    outlineOffset: 2,
    transition: reduced ? "none" : "top 180ms ease, left 180ms ease, width 180ms ease, height 180ms ease",
    pointerEvents: "none",
  };

  return (
    <div aria-hidden style={containerStyle} onClick={onClickOutside}>
      <div style={cutoutStyle} />
    </div>
  );
};
