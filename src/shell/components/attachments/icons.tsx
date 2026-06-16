interface GlyphProps {
  size?: number;
}

const stroke = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const PaperclipGlyph = ({ size = 14 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M20 11.5 12 19.4a5 5 0 0 1-7-7l8-7.9a3.3 3.3 0 0 1 4.7 4.7l-8 7.9a1.6 1.6 0 0 1-2.3-2.3l7.3-7.2" />
  </svg>
);

export const ImageGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="M21 16.5 16 12 6 20.5" />
  </svg>
);

export const MicGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0" />
    <path d="M12 17v4M9 21h6" />
  </svg>
);

export const VideoGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="m16 10 5-3v10l-5-3z" />
  </svg>
);

export const FileGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const LinkGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M10 13a4 4 0 0 0 5.7.4l3-3A4 4 0 0 0 13 4.7l-1.7 1.7" />
    <path d="M14 11a4 4 0 0 0-5.7-.4l-3 3A4 4 0 0 0 11 19.3l1.7-1.7" />
  </svg>
);

export const PlayGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M7 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const PauseGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const StopGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <rect x="6" y="6" width="12" height="12" rx="2.4" fill="currentColor" stroke="none" />
  </svg>
);

export const TrashGlyph = ({ size = 16 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const PlusGlyph = ({ size = 16 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const DownloadGlyph = ({ size = 16 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
    <path d="M5 19h14" />
  </svg>
);

export const CloseGlyph = ({ size = 18 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronLeftGlyph = ({ size = 22 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

export const ChevronRightGlyph = ({ size = 22 }: GlyphProps) => (
  <svg {...stroke(size)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);
