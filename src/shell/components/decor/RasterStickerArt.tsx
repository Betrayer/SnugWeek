import { useId } from "react";

const DILATE = 3.4;

interface RasterStickerArtProps {
  src: string;
  name?: string | null;
}

export const RasterStickerArt = ({ src, name }: RasterStickerArtProps) => {
  const filterId = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden={name ? undefined : true}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
        filter: "drop-shadow(0 2px 3px var(--sw-diecut-shadow))",
      }}
    >
      <defs>
        <filter
          id={filterId}
          x="-18%"
          y="-18%"
          width="136%"
          height="136%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={DILATE}
            result="dilated"
          />
          <feFlood
            result="flood"
            style={{ floodColor: "var(--sw-diecut)" }}
          />
          <feComposite
            in="flood"
            in2="dilated"
            operator="in"
            result="border"
          />
          <feMerge>
            <feMergeNode in="border" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {name ? <title>{name}</title> : null}
      <image
        href={src}
        x="0"
        y="0"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
};
