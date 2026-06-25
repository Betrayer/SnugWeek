import { ImageGlyph } from "../icons/glyphs.tsx";

interface PhotoDecorationArtProps {
  src: string | null;
  name: string | null;
}

export const PhotoDecorationArt = ({ src, name }: PhotoDecorationArtProps) => (
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
      <img
        src={src}
        alt={name ?? ""}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 2,
          display: "block",
        }}
      />
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
