import { decorationById } from "../../../data/decorations.tsx";
import type { Decoration } from "../../../services/repos/weeksRepo.ts";
import { DecorationArt } from "../decor/DecorationArt.tsx";
import { PhotoDecorationArt } from "../decor/PhotoDecorationArt.tsx";

interface StaticDecorationsProps {
  decorations: Decoration[];
  target: "week" | number;
}

const PHOTO_W = 116;
const PHOTO_H = 132;

export const StaticDecorations = ({ decorations, target }: StaticDecorationsProps) => {
  const items = decorations.filter((decoration) => decoration.target === target);
  if (items.length === 0) return null;
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      {items.map((decoration) => {
        const isPhoto = decoration.kind === "photo";
        const asset = isPhoto ? null : decorationById(decoration.asset);
        if (!isPhoto && !asset) return null;
        const w = isPhoto ? PHOTO_W : (asset?.w ?? PHOTO_W);
        const h = isPhoto ? PHOTO_H : (asset?.h ?? PHOTO_H);
        return (
          <div
            key={decoration.id}
            style={{
              position: "absolute",
              left: `${decoration.x}%`,
              top: `${decoration.y}%`,
              width: w * decoration.scale,
              height: h * decoration.scale,
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
              {isPhoto ? (
                <PhotoDecorationArt
                  src={decoration.src ?? decoration.thumbSrc}
                  name={null}
                  cropX={decoration.cropX}
                  cropY={decoration.cropY}
                  cropZoom={decoration.cropZoom}
                />
              ) : (
                <DecorationArt assetId={decoration.asset} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
