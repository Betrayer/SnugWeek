import { decorationById } from "../../../data/decorations.tsx";

interface DecorationArtProps {
  assetId: string;
}

export const DecorationArt = ({ assetId }: DecorationArtProps) => {
  const asset = decorationById(assetId);
  if (!asset) return null;
  return (
    <svg
      viewBox={asset.viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{
        color: asset.tint,
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
