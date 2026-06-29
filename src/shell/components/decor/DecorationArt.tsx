import { decorationById, isRasterAsset } from "../../../data/decorations.tsx";
import { RasterStickerArt } from "./RasterStickerArt.tsx";

interface DecorationArtProps {
  assetId: string;
}

export const DecorationArt = ({ assetId }: DecorationArtProps) => {
  const asset = decorationById(assetId);
  if (!asset) return null;
  if (isRasterAsset(asset) && asset.src) {
    return <RasterStickerArt src={asset.src} />;
  }
  return (
    <svg
      viewBox={asset.viewBox ?? "0 0 32 32"}
      preserveAspectRatio="xMidYMid meet"
      style={{
        color: asset.tint ?? "var(--sw-accent)",
        display: "block",
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
      aria-hidden
    >
      {asset.body}
    </svg>
  );
};
