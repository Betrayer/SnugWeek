import { decorationById } from "../../../data/decorations.tsx";
import type { Decoration } from "../../../services/repos/weeksRepo.ts";
import { DecorationArt } from "../decor/DecorationArt.tsx";

interface StaticDecorationsProps {
  decorations: Decoration[];
  target: "week" | number;
}

export const StaticDecorations = ({ decorations, target }: StaticDecorationsProps) => {
  const items = decorations.filter((decoration) => decoration.target === target);
  if (items.length === 0) return null;
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      {items.map((decoration) => {
        const asset = decorationById(decoration.asset);
        if (!asset) return null;
        return (
          <div
            key={decoration.id}
            style={{
              position: "absolute",
              left: `${decoration.x}%`,
              top: `${decoration.y}%`,
              width: asset.w * decoration.scale,
              height: asset.h * decoration.scale,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                transform: `rotate(${decoration.rotation}deg)`,
                transformOrigin: "center",
              }}
            >
              <DecorationArt assetId={decoration.asset} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
