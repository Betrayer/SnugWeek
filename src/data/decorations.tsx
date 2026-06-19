import type { ReactNode } from "react";

export type DecorationKind = "sticker" | "washi" | "doodle";

export interface DecorationAsset {
  id: string;
  kind: DecorationKind;
  tint: string;
  w: number;
  h: number;
  viewBox: string;
  body: ReactNode;
  animated?: boolean;
}

export const isAnimatedAsset = (asset: DecorationAsset): boolean =>
  asset.animated ?? asset.kind === "sticker";

export interface DecorationAnimation {
  id: string;
  animate?: { rotate?: number[]; y?: number[]; scale?: number[] };
  transition?: { duration: number; ease: "easeInOut" | "linear"; repeat: number };
}

export const DEFAULT_DECORATION_ANIMATION = "none";

export const DECORATION_ANIMATIONS: DecorationAnimation[] = [
  { id: "none" },
  {
    id: "sway",
    animate: { rotate: [-3, 3, -3] },
    transition: { duration: 4, ease: "easeInOut", repeat: Infinity },
  },
  {
    id: "spin",
    animate: { rotate: [0, 360] },
    transition: { duration: 7, ease: "linear", repeat: Infinity },
  },
  {
    id: "bob",
    animate: { y: [0, -6, 0] },
    transition: { duration: 3, ease: "easeInOut", repeat: Infinity },
  },
  {
    id: "pulse",
    animate: { scale: [1, 1.08, 1] },
    transition: { duration: 2.6, ease: "easeInOut", repeat: Infinity },
  },
];

const ANIMATION_BY_ID = new Map(
  DECORATION_ANIMATIONS.map((animation) => [animation.id, animation]),
);

export const decorationAnimationById = (
  id: string,
): DecorationAnimation | undefined => ANIMATION_BY_ID.get(id);

const inner = "color-mix(in srgb, var(--sw-card) 78%, currentColor)";

export const DECORATIONS: DecorationAsset[] = [
  {
    id: "heart",
    kind: "sticker",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <path
        d="M16 27C16 27 4 19.4 4 11.4A6 6 0 0 1 16 9.2 6 6 0 0 1 28 11.4C28 19.4 16 27 16 27Z"
        fill="currentColor"
      />
    ),
  },
  {
    id: "star",
    kind: "sticker",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <path
        d="M16 4 19.6 12.4 28.6 13 21.6 19 24 28 16 23 8 28 10.4 19 3.4 13 12.4 12.4Z"
        fill="currentColor"
      />
    ),
  },
  {
    id: "flower",
    kind: "sticker",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g fill="currentColor">
        <circle cx="16" cy="8.5" r="5" />
        <circle cx="23.5" cy="14" r="5" />
        <circle cx="20.6" cy="23" r="5" />
        <circle cx="11.4" cy="23" r="5" />
        <circle cx="8.5" cy="14" r="5" />
        <circle cx="16" cy="16" r="4.6" fill={inner} />
      </g>
    ),
  },
  {
    id: "sun",
    kind: "sticker",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      >
        <circle cx="16" cy="16" r="6.4" fill="currentColor" stroke="none" />
        <path d="M16 3.6V6M16 26v2.4M3.6 16H6M26 16h2.4M7 7l1.7 1.7M23.3 23.3 25 25M25 7l-1.7 1.7M8.7 23.3 7 25" />
      </g>
    ),
  },
  {
    id: "cloud",
    kind: "sticker",
    tint: "var(--sw-ink-3)",
    w: 60,
    h: 48,
    viewBox: "0 0 32 26",
    body: (
      <path
        d="M9 22a6 6 0 0 1 .4-12 7.2 7.2 0 0 1 13.6-1.6A5.4 5.4 0 0 1 24 19.6 5 5 0 0 1 23 22Z"
        fill="currentColor"
      />
    ),
  },
  {
    id: "moon",
    kind: "sticker",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <path
        d="M22 5.5A11.4 11.4 0 1 0 26.6 22 9 9 0 0 1 22 5.5Z"
        fill="currentColor"
      />
    ),
  },
  {
    id: "leaf",
    kind: "sticker",
    tint: "var(--sw-done)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path
          d="M6 26C6 14.4 12.4 7.6 26 7.6 26 21.2 19.2 27.4 6 26Z"
          fill="currentColor"
        />
        <path
          d="M9.5 22.5C13.5 16.5 18 12.6 23 10.6"
          fill="none"
          stroke={inner}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: "mushroom",
    kind: "sticker",
    tint: "var(--sw-danger)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path
          d="M4.4 16.2A11.6 8.6 0 0 1 27.6 16.2Z"
          fill="currentColor"
        />
        <circle cx="11" cy="12.4" r="1.7" fill={inner} />
        <circle cx="19.5" cy="11.4" r="1.4" fill={inner} />
        <path
          d="M12 16.2h8v6.4a4 4 0 0 1-8 0Z"
          fill={inner}
        />
      </g>
    ),
  },
  {
    id: "cup",
    kind: "sticker",
    tint: "var(--sw-ink-3)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path
          d="M7 13h13v6.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M20 14.5h2.6a2.8 2.8 0 0 1 0 5.6H20" />
        <path d="M11 5.5c0 1.6-1.2 2-1.2 3.6M15.4 5.5c0 1.6-1.2 2-1.2 3.6" />
      </g>
    ),
  },
  {
    id: "bow",
    kind: "sticker",
    tint: "var(--sw-accent)",
    w: 56,
    h: 44,
    viewBox: "0 0 32 24",
    body: (
      <g fill="currentColor">
        <path d="M15 12 5.5 6.5v11Z" />
        <path d="M17 12 26.5 6.5v11Z" />
        <rect x="13.4" y="8.6" width="5.2" height="6.8" rx="1.6" fill={inner} />
      </g>
    ),
  },
  {
    id: "smiley",
    kind: "sticker",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="16" cy="16" r="11.4" fill="currentColor" />
        <circle cx="11.8" cy="13.6" r="1.7" fill={inner} />
        <circle cx="20.2" cy="13.6" r="1.7" fill={inner} />
        <path
          d="M11 19c1.4 2 3 3 5 3s3.6-1 5-3"
          fill="none"
          stroke={inner}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: "washi-plain",
    kind: "washi",
    tint: "var(--sw-accent)",
    w: 124,
    h: 34,
    viewBox: "0 0 80 22",
    body: <rect x="1" y="3" width="78" height="16" rx="2" fill="currentColor" opacity="0.5" />,
  },
  {
    id: "washi-dots",
    kind: "washi",
    tint: "var(--sw-done)",
    w: 124,
    h: 34,
    viewBox: "0 0 80 22",
    body: (
      <g>
        <rect x="1" y="3" width="78" height="16" rx="2" fill="currentColor" opacity="0.5" />
        <g fill="var(--sw-card)">
          {[8, 20, 32, 44, 56, 68].map((cx) => (
            <circle key={cx} cx={cx} cy="11" r="2.2" />
          ))}
        </g>
      </g>
    ),
  },
  {
    id: "washi-stripe",
    kind: "washi",
    tint: "var(--sw-accent-2)",
    w: 124,
    h: 34,
    viewBox: "0 0 80 22",
    body: (
      <g>
        <rect x="1" y="3" width="78" height="16" rx="2" fill="currentColor" opacity="0.5" />
        <g stroke="var(--sw-card)" strokeWidth="2.4">
          {[4, 14, 24, 34, 44, 54, 64, 74].map((x) => (
            <path key={x} d={`M${x} 3 ${x - 7} 19`} />
          ))}
        </g>
      </g>
    ),
  },
  {
    id: "washi-check",
    kind: "washi",
    tint: "var(--sw-ink-3)",
    w: 124,
    h: 34,
    viewBox: "0 0 80 22",
    body: (
      <g>
        <rect x="1" y="3" width="78" height="16" rx="2" fill="currentColor" opacity="0.5" />
        <g stroke="var(--sw-card)" strokeWidth="1.6">
          <path d="M1 11H79" />
          {[8, 16, 24, 32, 40, 48, 56, 64, 72].map((x) => (
            <path key={x} d={`M${x} 3V19`} />
          ))}
        </g>
      </g>
    ),
  },
  {
    id: "washi-wave",
    kind: "washi",
    tint: "var(--sw-accent)",
    w: 124,
    h: 34,
    viewBox: "0 0 80 22",
    body: (
      <g>
        <rect x="1" y="3" width="78" height="16" rx="2" fill="currentColor" opacity="0.5" />
        <path
          d="M2 11q5-5 10 0t10 0 10 0 10 0 10 0 10 0 6 0"
          fill="none"
          stroke="var(--sw-card)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: "arrow",
    kind: "doodle",
    tint: "var(--sw-ink-2)",
    w: 58,
    h: 40,
    viewBox: "0 0 32 22",
    body: (
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 11h22" />
        <path d="M19 5l7 6-7 6" />
      </g>
    ),
  },
  {
    id: "arrow-curve",
    kind: "doodle",
    tint: "var(--sw-ink-2)",
    w: 54,
    h: 48,
    viewBox: "0 0 30 26",
    body: (
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 22C5 11 12 5 25 7" />
        <path d="M25 7 18.5 4.5M25 7 21.5 13" />
      </g>
    ),
  },
  {
    id: "underline",
    kind: "doodle",
    tint: "var(--sw-accent)",
    w: 64,
    h: 26,
    viewBox: "0 0 34 12",
    body: (
      <path
        d="M2 6C9 11 25 11 32 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    ),
  },
  {
    id: "squiggle",
    kind: "doodle",
    tint: "var(--sw-accent-2)",
    w: 64,
    h: 28,
    viewBox: "0 0 34 14",
    body: (
      <path
        d="M2 7q4-6 8 0t8 0 8 0 6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    ),
  },
  {
    id: "sparkle",
    kind: "doodle",
    tint: "var(--sw-accent)",
    w: 48,
    h: 48,
    viewBox: "0 0 32 32",
    body: (
      <path
        d="M16 4C16 11.6 16.4 12 11 16 16.4 20 16 20.4 16 28 16 20.4 15.6 20 21 16 15.6 12 16 11.6 16 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "scribble-circle",
    kind: "doodle",
    tint: "var(--sw-accent-2)",
    w: 56,
    h: 56,
    viewBox: "0 0 32 32",
    body: (
      <path
        d="M21 7.5C13 3.5 5.5 9 7.5 17.5 9 25 21 26.5 24 18 25.6 13 21.5 8.5 16 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    ),
  },
  {
    id: "heart-outline",
    kind: "doodle",
    tint: "var(--sw-accent)",
    w: 50,
    h: 50,
    viewBox: "0 0 32 32",
    body: (
      <path
        d="M16 26.4C16 26.4 5 19.4 5 11.8A5.6 5.6 0 0 1 16 9.6 5.6 5.6 0 0 1 27 11.8C27 19.4 16 26.4 16 26.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "star-outline",
    kind: "doodle",
    tint: "var(--sw-accent-2)",
    w: 50,
    h: 50,
    viewBox: "0 0 32 32",
    body: (
      <path
        d="M16 4 19.6 12.4 28.6 13 21.6 19 24 28 16 23 8 28 10.4 19 3.4 13 12.4 12.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    ),
  },
];

export const DECORATION_KINDS: DecorationKind[] = ["sticker", "washi", "doodle"];

const BY_ID = new Map(DECORATIONS.map((asset) => [asset.id, asset]));

export const decorationById = (id: string): DecorationAsset | undefined =>
  BY_ID.get(id);

export const isDecorationKind = (value: string): value is DecorationKind =>
  value === "sticker" || value === "washi" || value === "doodle";
