interface GlyphProps {
  size?: number;
  strokeWidth?: number;
}

const stroke = (size: number, strokeWidth = 1.9) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const PaperclipGlyph = ({ size = 14, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M20 11.5 12 19.4a5 5 0 0 1-7-7l8-7.9a3.3 3.3 0 0 1 4.7 4.7l-8 7.9a1.6 1.6 0 0 1-2.3-2.3l7.3-7.2" />
  </svg>
);

export const PinGlyph = ({ size = 16, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5z" />
    <path d="M12 14v6" />
  </svg>
);

export const ImageGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="M21 16.5 16 12 6 20.5" />
  </svg>
);

export const MicGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0" />
    <path d="M12 17v4M9 21h6" />
  </svg>
);

export const VideoGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="m16 10 5-3v10l-5-3z" />
  </svg>
);

export const FileGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const LinkGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M10 13a4 4 0 0 0 5.7.4l3-3A4 4 0 0 0 13 4.7l-1.7 1.7" />
    <path d="M14 11a4 4 0 0 0-5.7-.4l-3 3A4 4 0 0 0 11 19.3l1.7-1.7" />
  </svg>
);

export const PlayGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M7 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const PauseGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const StopGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <rect x="6" y="6" width="12" height="12" rx="2.4" fill="currentColor" stroke="none" />
  </svg>
);

export const TrashGlyph = ({ size = 16, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const PlusGlyph = ({ size = 16, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PencilGlyph = ({ size = 16, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M14 5.5 18.5 10 8 20.5l-4.5.5.5-4.5z" />
    <path d="m13 6.5 4.5 4.5" />
  </svg>
);

export const ExpandGlyph = ({ size = 16, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M9 4H5a1 1 0 0 0-1 1v4" />
    <path d="M15 4h4a1 1 0 0 1 1 1v4" />
    <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
    <path d="M4 15v4a1 1 0 0 0 1 1h4" />
  </svg>
);

export const DownloadGlyph = ({ size = 16, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
    <path d="M5 19h14" />
  </svg>
);

export const CropGlyph = ({ size = 16, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M6 2v16h16" />
    <path d="M18 22V6H2" />
  </svg>
);

export const CloseGlyph = ({ size = 18, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronLeftGlyph = ({ size = 22, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

export const ChevronRightGlyph = ({ size = 22, strokeWidth }: GlyphProps) => (
  <svg {...stroke(size, strokeWidth)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

interface CheckGlyphProps {
  size?: number;
  color?: string;
}

export const CheckGlyph = ({
  size = 12,
  color = "var(--sw-accent-ink)",
}: CheckGlyphProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={3.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M5 12l4.5 4.5L19 7" />
  </svg>
);

export const DrawnCheckGlyph = ({
  size,
  done,
}: {
  size: number;
  done: boolean;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--sw-accent-ink)"
    strokeWidth={3.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path
      d="M5 12l4.5 4.5L19 7"
      pathLength={1}
      style={{
        strokeDasharray: 1,
        strokeDashoffset: done ? 0 : 1,
        transition: "stroke-dashoffset 200ms ease",
      }}
    />
  </svg>
);
