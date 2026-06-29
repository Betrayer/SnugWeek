import type { CSSProperties } from "react";

interface CropFocus {
  cropX: number | null;
  cropY: number | null;
  cropZoom: number | null;
}

export const cropImageStyle = ({
  cropX,
  cropY,
  cropZoom,
}: CropFocus): CSSProperties => {
  const x = cropX ?? 50;
  const y = cropY ?? 50;
  const zoom = cropZoom ?? 1;
  return {
    objectFit: "cover",
    objectPosition: `${x}% ${y}%`,
    ...(zoom > 1
      ? { transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }
      : {}),
  };
};
