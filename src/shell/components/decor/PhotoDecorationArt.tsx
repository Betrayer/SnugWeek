import { cropImageStyle } from "../attachments/cropStyle.ts";
import { ImageGlyph } from "../icons/glyphs.tsx";

interface PhotoDecorationArtProps {
  src: string | null;
  name: string | null;
  cropX?: number | null;
  cropY?: number | null;
  cropZoom?: number | null;
}

export const PhotoDecorationArt = ({
  src,
  name,
  cropX = null,
  cropY = null,
  cropZoom = null,
}: PhotoDecorationArtProps) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      padding: "6px 6px 18px",
      backgroundColor: "var(--sw-card)",
      border: "1px solid var(--sw-line)",
      borderRadius: 4,
      boxShadow: "var(--sw-shadow)",
      display: "flex",
    }}
  >
    {src ? (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 2,
          overflow: "hidden",
          display: "block",
        }}
      >
        <img
          src={src}
          alt={name ?? ""}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            ...cropImageStyle({ cropX, cropY, cropZoom }),
          }}
        />
      </div>
    ) : (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--sw-ink-3)",
          backgroundColor: "var(--sw-paper-2)",
          borderRadius: 2,
        }}
      >
        <ImageGlyph size={24} />
      </div>
    )}
  </div>
);
