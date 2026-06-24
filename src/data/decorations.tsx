import type { ReactNode } from "react";
import type { DecorationCategory } from "./decorationCategories.ts";
import { DROPPED_DECORATIONS } from "./stickerDrops.tsx";

export type DecorationKind = "sticker" | "washi" | "doodle";

export interface DecorationAsset {
  id: string;
  kind: DecorationKind;
  category?: DecorationCategory;
  tint: string;
  w: number;
  h: number;
  viewBox: string;
  body: ReactNode;
  animated?: boolean;
}

export const isAnimatedAsset = (asset: DecorationAsset): boolean =>
  asset.animated ?? asset.kind === "sticker";

export const assetCategory = (asset: DecorationAsset): DecorationCategory =>
  asset.category ?? (asset.kind === "sticker" ? "misc" : asset.kind);

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

const INLINE_DECORATIONS: DecorationAsset[] = [
  {
    id: "heart",
    kind: "sticker",
    category: "hearts",
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
  {
    id: "cat",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <polygon points="7 6 12 13 7 14" fill="currentColor" />
        <polygon points="25 6 20 13 25 14" fill="currentColor" />
        <circle cx="16" cy="18" r="9" fill="currentColor" />
        <circle cx="12.4" cy="16.4" r="1.6" fill={inner} />
        <circle cx="19.6" cy="16.4" r="1.6" fill={inner} />
        <circle cx="16" cy="20" r="1.2" fill={inner} />
        <path d="M9 19.5l-3.5-1M9 21l-3.5 0.6M23 19.5l3.5-1M23 21l3.5 0.6" fill="none" stroke={inner} strokeWidth="1" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "fox",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <polygon points="6 7 13 11 8 15" fill="currentColor" />
        <polygon points="26 7 19 11 24 15" fill="currentColor" />
        <path d="M16 9C20 9 23 12 23 16C23 21 20 25 16 25C12 25 9 21 9 16C9 12 12 9 16 9Z" fill="currentColor" />
        <path d="M16 18C18.5 18 21 15 22 12C22 12 19 14 16 14C13 14 10 12 10 12C11 15 13.5 18 16 18Z" fill="var(--sw-card)" />
        <circle cx="13.2" cy="16" r="1.4" fill={inner} />
        <circle cx="18.8" cy="16" r="1.4" fill={inner} />
        <circle cx="16" cy="21" r="1.3" fill={inner} />
      </g>
    ),
  },
  {
    id: "bunny",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-ink-3)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <ellipse cx="12.5" cy="9" rx="2.4" ry="6" fill="currentColor" />
        <ellipse cx="19.5" cy="9" rx="2.4" ry="6" fill="currentColor" />
        <ellipse cx="12.5" cy="9" rx="1" ry="3.4" fill={inner} />
        <ellipse cx="19.5" cy="9" rx="1" ry="3.4" fill={inner} />
        <circle cx="16" cy="21" r="7.5" fill="currentColor" />
        <circle cx="13.2" cy="20" r="1.4" fill={inner} />
        <circle cx="18.8" cy="20" r="1.4" fill={inner} />
        <path d="M14.5 23.5c0.8 0.8 2.2 0.8 3 0" fill="none" stroke={inner} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "bird",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <ellipse cx="15" cy="17" rx="9" ry="8" fill="currentColor" />
        <path d="M16 16C12 16 8 18 6 22C9 21 13 21 16 20Z" fill={inner} />
        <circle cx="19" cy="14" r="1.6" fill={inner} />
        <circle cx="19" cy="14" r="0.7" fill="var(--sw-card)" />
        <polygon points="23 14 28 15.5 23 17" fill="var(--sw-accent)" />
        <path d="M14 24c0 2 0 3 0 3M18 24c0 2 0 3 0 3" fill="none" stroke="var(--sw-accent)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "bee",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <ellipse cx="11" cy="12" rx="5" ry="4" fill="var(--sw-card)" stroke={inner} strokeWidth="1.2" />
        <ellipse cx="21" cy="12" rx="5" ry="4" fill="var(--sw-card)" stroke={inner} strokeWidth="1.2" />
        <ellipse cx="16" cy="19" rx="7" ry="8" fill="currentColor" />
        <path d="M9.4 17.5h13.2M9.8 22h12.4" fill="none" stroke="var(--sw-ink-2)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="13.5" cy="13.5" r="1.2" fill="var(--sw-ink-2)" />
        <circle cx="18.5" cy="13.5" r="1.2" fill="var(--sw-ink-2)" />
      </g>
    ),
  },
  {
    id: "fish",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <ellipse cx="14" cy="16" rx="9" ry="6.5" fill="currentColor" />
        <polygon points="22 16 29 11 29 21" fill="currentColor" />
        <path d="M14 9.5c1.5 1 1.5 3 0 4M14 22.5c1.5-1 1.5-3 0-4" fill={inner} />
        <circle cx="9" cy="14.5" r="1.6" fill="var(--sw-card)" />
        <circle cx="9" cy="14.5" r="0.8" fill="var(--sw-ink-2)" />
        <circle cx="17" cy="16" r="1.3" fill={inner} />
        <circle cx="20.5" cy="14" r="1.1" fill={inner} />
      </g>
    ),
  },
  {
    id: "ladybug",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-danger)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="16" cy="10" r="3.4" fill="var(--sw-ink-2)" />
        <circle cx="16" cy="18" r="9" fill="currentColor" />
        <path d="M16 9v18" fill="none" stroke="var(--sw-ink-2)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="11.5" cy="15" r="1.6" fill="var(--sw-ink-2)" />
        <circle cx="20.5" cy="15" r="1.6" fill="var(--sw-ink-2)" />
        <circle cx="11.5" cy="21" r="1.6" fill="var(--sw-ink-2)" />
        <circle cx="20.5" cy="21" r="1.6" fill="var(--sw-ink-2)" />
        <circle cx="14.6" cy="9.4" r="0.8" fill="var(--sw-card)" />
        <circle cx="17.4" cy="9.4" r="0.8" fill="var(--sw-card)" />
      </g>
    ),
  },
  {
    id: "snail",
    kind: "sticker",
    category: "animals",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M5 23C5 23 6 19 11 19C17 19 17 25 22 25L27 25" fill="none" stroke="var(--sw-ink-3)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="15" r="8" fill="currentColor" />
        <path d="M19 15m-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0" fill="none" stroke={inner} strokeWidth="1.6" />
        <path d="M19 15m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0" fill="none" stroke={inner} strokeWidth="1.6" />
        <line x1="7" y1="22" x2="5" y2="17" stroke="var(--sw-ink-3)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="5" cy="16.5" r="1.2" fill="var(--sw-ink-2)" />
      </g>
    ),
  },
  {
    id: "cupcake",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M9 17h14l-1.6 9a2 2 0 0 1-2 1.8h-6.8a2 2 0 0 1-2-1.8Z" fill={inner} />
        <path d="M9 17.2c-1.6-1-1.6-3.4 0-4.4-0.6-2 1-3.8 3-3.4 0.6-2 3-2.8 4.6-1.4 1.2-1.4 3.6-1 4.4 0.8 2.2-0.4 3.8 1.8 2.8 3.6 1.6 1 1.6 3.4 0 4.4Z" fill="currentColor" />
        <rect x="15" y="6.4" width="2" height="3" rx="1" fill={inner} />
      </g>
    ),
  },
  {
    id: "donut",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="16" cy="16" r="11.4" fill="currentColor" />
        <path d="M16 4.6a11.4 11.4 0 0 0-9.2 18.1c1.6-1.6 3.6-3.1 5.4-2.1 1.5 0.8 2.4-1.2 4-0.6 1.6 0.6 1.8-1.6 3.4-1.2 1.8 0.4 3.2-1.4 5.2-0.6a11.4 11.4 0 0 0-8.8-13.6Z" fill={inner} />
        <circle cx="16" cy="16" r="4.4" fill="var(--sw-card)" />
        <line x1="10.5" y1="9.5" x2="12" y2="11" stroke="var(--sw-danger)" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="22" y1="11" x2="23.6" y2="10" stroke="var(--sw-accent)" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="9" y1="15" x2="10.6" y2="14.6" stroke="var(--sw-done)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "strawberry",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-danger)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 9c5 0 9 2.6 9 6.6 0 5.4-5.2 11.4-9 11.4s-9-6-9-11.4C7 11.6 11 9 16 9Z" fill="currentColor" />
        <path d="M16 4.4c1.4 1 3 1.2 4.6 0.8-0.4 1.6-1.6 2.8-3.2 3.2 1.6 0.4 3.2-0.2 4.4-1.4-0.2 2.4-2.6 4-5.8 4s-5.6-1.6-5.8-4c1.2 1.2 2.8 1.8 4.4 1.4-1.6-0.4-2.8-1.6-3.2-3.2 1.6 0.4 3.2 0.2 4.6-0.8Z" fill="var(--sw-done)" />
        <circle cx="12.4" cy="14.6" r="0.9" fill={inner} />
        <circle cx="16" cy="13.6" r="0.9" fill={inner} />
        <circle cx="19.6" cy="14.6" r="0.9" fill={inner} />
        <circle cx="14.2" cy="18" r="0.9" fill={inner} />
        <circle cx="17.8" cy="18" r="0.9" fill={inner} />
        <circle cx="16" cy="21.6" r="0.9" fill={inner} />
      </g>
    ),
  },
  {
    id: "cherry",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-danger)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M20 6c-4 2.4-8 5.6-9.4 11" fill="none" stroke="var(--sw-done)" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 6c-2 3-1 6.4 1.6 9" fill="none" stroke="var(--sw-done)" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 4c1.6 0.4 3.4 0.4 5 0-0.6 1.8-2.4 2.8-4.2 2.4 1.6 0.8 3.6 0.6 5-0.6-0.4 2-2.8 3-5.4 2.4" fill="var(--sw-done)" />
        <circle cx="10" cy="22" r="4.6" fill="currentColor" />
        <circle cx="21.6" cy="21" r="4.6" fill="currentColor" />
        <circle cx="8.4" cy="20.6" r="1.2" fill={inner} />
        <circle cx="20" cy="19.6" r="1.2" fill={inner} />
      </g>
    ),
  },
  {
    id: "teapot",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M7 18a9 7 0 0 1 18 0Z" fill="currentColor" />
        <path d="M7 18h18a9 6 0 0 1-18 0Z" fill="currentColor" />
        <path d="M25 16c2.4-0.4 4 1 4 3.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M5 17c-1.6 0-2.6 1-2.6 2.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="9.4" r="1.8" fill="currentColor" />
        <path d="M12 14a4 2.4 0 0 1 8 0Z" fill={inner} />
        <line x1="16" y1="24" x2="16" y2="26.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "cookie",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-ink-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 4.6a11.4 11.4 0 1 1-8.4 3.4c1 1.6 3.4 1.6 4-0.2 1.6 1.2 1.4 3.4 4 3 1.8-0.2 1.6 2.4 3.6 2 1.8-0.4 2.4 2 4.6 1.6A11.4 11.4 0 0 0 16 4.6Z" fill="currentColor" />
        <circle cx="12" cy="15" r="1.6" fill={inner} />
        <circle cx="19.4" cy="13.4" r="1.4" fill={inner} />
        <circle cx="15.6" cy="20" r="1.6" fill={inner} />
        <circle cx="20.6" cy="19.6" r="1.3" fill={inner} />
        <circle cx="10.6" cy="20.4" r="1.2" fill={inner} />
      </g>
    ),
  },
  {
    id: "ice-cream",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M11 16h10l-4.2 11a0.8 0.8 0 0 1-1.6 0Z" fill="var(--sw-ink-3)" />
        <line x1="12.6" y1="17.4" x2="15.4" y2="22" stroke="var(--sw-card)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="19.4" y1="17.4" x2="16.6" y2="22" stroke="var(--sw-card)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M9 16a4 4 0 0 1 1.2-6.6A4.4 4.4 0 0 1 16 6a4.4 4.4 0 0 1 5.8 3.4A4 4 0 0 1 23 16Z" fill="currentColor" />
        <circle cx="13" cy="12" r="1.3" fill={inner} />
        <circle cx="18.6" cy="11.4" r="1.1" fill={inner} />
      </g>
    ),
  },
  {
    id: "candy",
    kind: "sticker",
    category: "food",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="16" cy="16" r="6.4" fill="currentColor" />
        <path d="M9.6 16 3.6 11.6c-0.8-0.6-1.8 0.2-1.4 1.2l1.6 3.2-1.6 3.2c-0.4 1 0.6 1.8 1.4 1.2Z" fill="currentColor" />
        <path d="M22.4 16 28.4 11.6c0.8-0.6 1.8 0.2 1.4 1.2l-1.6 3.2 1.6 3.2c0.4 1-0.6 1.8-1.4 1.2Z" fill="currentColor" />
        <line x1="13.4" y1="13.6" x2="15.6" y2="18.6" stroke={inner} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="16.6" y1="13.4" x2="18.6" y2="18.4" stroke={inner} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "cactus",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-done)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <rect x="10.5" y="24" width="11" height="5" rx="1.6" fill="var(--sw-accent)" />
        <rect x="13.6" y="9" width="4.8" height="16" rx="2.4" fill="currentColor" />
        <path d="M13.6 16.5H10.5A2.5 2.5 0 0 1 8 14V12.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.4 18.5H21.5A2.5 2.5 0 0 0 24 16V14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="11.5" r="1.1" fill={inner} />
        <circle cx="16" cy="15.5" r="1.1" fill={inner} />
      </g>
    ),
  },
  {
    id: "tulip",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 14V28" fill="none" stroke="var(--sw-done)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 22C13 22 10 20 9.5 17" fill="none" stroke="var(--sw-done)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 19C19 19 22 17.5 22.5 14.5" fill="none" stroke="var(--sw-done)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M9 9.5C9 14 12 16 16 16C20 16 23 14 23 9.5C23 9.5 20.5 11.5 19 11C19 11 18.5 8 16 7C13.5 8 13 11 13 11C11.5 11.5 9 9.5 9 9.5Z" fill="currentColor" />
        <path d="M16 9V15" fill="none" stroke={inner} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "clover",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-done)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 16V28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 16C13 12 8 13 8 17C8 20 11 21 16 16Z" fill="currentColor" />
        <path d="M16 16C19 12 24 13 24 17C24 20 21 21 16 16Z" fill="currentColor" />
        <path d="M16 16C12 13 11 8 15 8C18 8 19 11 16 16Z" fill="currentColor" />
        <circle cx="16" cy="15" r="1.4" fill={inner} />
      </g>
    ),
  },
  {
    id: "sprout",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-done)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 28V14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M16 18C16 13 12 10 7.5 11C7 15.5 11 19 16 18Z" fill="currentColor" />
        <path d="M16 16C16 11.5 20 9 24.5 10C25 14.5 21 17 16 16Z" fill="currentColor" />
        <path d="M9.5 13.5L14.5 16.5" fill="none" stroke={inner} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M22.5 12.5L17.5 14.5" fill="none" stroke={inner} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "pine-tree",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-done)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <rect x="14.4" y="24" width="3.2" height="5" rx="0.8" fill="var(--sw-ink-3)" />
        <polygon points="16,4 23,13 9,13" fill="currentColor" />
        <polygon points="16,9 24,19 8,19" fill="currentColor" />
        <polygon points="16,14 25.5,25 6.5,25" fill="currentColor" />
        <circle cx="16" cy="4.5" r="1.4" fill="var(--sw-accent-2)" />
      </g>
    ),
  },
  {
    id: "acorn",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-ink-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M9 16C9 23 12 28 16 28C20 28 23 23 23 16Z" fill="currentColor" />
        <path d="M8 13C8 9.7 11.6 8 16 8C20.4 8 24 9.7 24 13C24 14.7 22.4 16 16 16C9.6 16 8 14.7 8 13Z" fill="var(--sw-accent-2)" />
        <path d="M16 4V8" fill="none" stroke="var(--sw-accent-2)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M11 11.5H21" fill="none" stroke={inner} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="16" cy="21" r="1.6" fill={inner} />
      </g>
    ),
  },
  {
    id: "daisy",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-card)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 16V28" fill="none" stroke="var(--sw-done)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 22C13.5 22 11.5 20.5 11 18" fill="none" stroke="var(--sw-done)" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="16" cy="7.5" rx="2.6" ry="4.5" fill="var(--sw-ink-2)" />
        <ellipse cx="16" cy="22.5" rx="2.6" ry="4.5" fill="var(--sw-ink-2)" />
        <ellipse cx="8.5" cy="15" rx="4.5" ry="2.6" fill="var(--sw-ink-2)" />
        <ellipse cx="23.5" cy="15" rx="4.5" ry="2.6" fill="var(--sw-ink-2)" />
        <ellipse cx="10.5" cy="9.5" rx="4.2" ry="2.6" fill="var(--sw-ink-2)" transform="rotate(-45 10.5 9.5)" />
        <ellipse cx="21.5" cy="9.5" rx="4.2" ry="2.6" fill="var(--sw-ink-2)" transform="rotate(45 21.5 9.5)" />
        <ellipse cx="10.5" cy="20.5" rx="4.2" ry="2.6" fill="var(--sw-ink-2)" transform="rotate(45 10.5 20.5)" />
        <ellipse cx="21.5" cy="20.5" rx="4.2" ry="2.6" fill="var(--sw-ink-2)" transform="rotate(-45 21.5 20.5)" />
        <circle cx="16" cy="15" r="3.4" fill="var(--sw-accent-2)" />
      </g>
    ),
  },
  {
    id: "berry-branch",
    kind: "sticker",
    category: "plants",
    tint: "var(--sw-danger)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M8 6C12 10 16 16 18 26" fill="none" stroke="var(--sw-done)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M11 9C8 9 6.5 11 6.5 13" fill="none" stroke="var(--sw-done)" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 16C18.5 15.5 20.5 13.5 21 11" fill="none" stroke="var(--sw-done)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="15" r="3.2" fill="currentColor" />
        <circle cx="24.5" cy="20.5" r="3.2" fill="currentColor" />
        <circle cx="19.5" cy="21" r="3.2" fill="currentColor" />
        <circle cx="21.2" cy="14" r="0.9" fill={inner} />
        <circle cx="23.7" cy="19.5" r="0.9" fill={inner} />
        <circle cx="18.7" cy="20" r="0.9" fill={inner} />
      </g>
    ),
  },
  {
    id: "rainbow",
    kind: "sticker",
    category: "weather",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M5 23a11 11 0 0 1 22 0" fill="none" stroke="var(--sw-danger)" strokeWidth="3" strokeLinecap="round" />
        <path d="M9 23a7 7 0 0 1 14 0" fill="none" stroke="var(--sw-accent-2)" strokeWidth="3" strokeLinecap="round" />
        <path d="M13 23a3 3 0 0 1 6 0" fill="none" stroke="var(--sw-done)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="7" cy="24" r="2.4" fill={inner} />
        <circle cx="25" cy="24" r="2.4" fill={inner} />
      </g>
    ),
  },
  {
    id: "raindrop",
    kind: "sticker",
    category: "weather",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 4C16 4 7 15 7 21A9 9 0 0 0 25 21C25 15 16 4 16 4Z" fill="currentColor" />
        <ellipse cx="13" cy="20" rx="2.2" ry="3.4" fill={inner} />
      </g>
    ),
  },
  {
    id: "snowflake",
    kind: "sticker",
    category: "weather",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16" y1="4" x2="16" y2="28" />
        <line x1="5.6" y1="10" x2="26.4" y2="22" />
        <line x1="5.6" y1="22" x2="26.4" y2="10" />
        <polyline points="12.5,7 16,4 19.5,7" />
        <polyline points="12.5,25 16,28 19.5,25" />
        <polyline points="5.6,14 5.6,10 9.6,10.5" />
        <polyline points="22.4,21.5 26.4,22 26.4,18" />
        <polyline points="9.6,21.5 5.6,22 5.6,18" />
        <polyline points="26.4,14 26.4,10 22.4,10.5" />
      </g>
    ),
  },
  {
    id: "umbrella",
    kind: "sticker",
    category: "weather",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M4 16A12 12 0 0 1 28 16Z" fill="currentColor" />
        <path d="M16 16V25A3 3 0 0 0 22 25" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 16A3 3 0 0 1 16 16M16 16A3 3 0 0 1 22 16" fill="none" stroke={inner} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "lightning",
    kind: "sticker",
    category: "weather",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <polygon points="18,4 8,18 14,18 12,28 24,13 17,13" fill="currentColor" />
        <polygon points="17,8 13,15 16,15 15,21 20,13 16.5,13" fill={inner} />
      </g>
    ),
  },
  {
    id: "breeze",
    kind: "sticker",
    category: "weather",
    tint: "var(--sw-ink-3)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11H20A3.5 3.5 0 1 0 16.5 7.5" />
        <path d="M4 17H26A3.5 3.5 0 1 1 22.5 20.5" />
        <path d="M4 23H17A3 3 0 1 1 14 26" />
      </g>
    ),
  },
  {
    id: "dew",
    kind: "sticker",
    category: "weather",
    tint: "var(--sw-done)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M5 14C5 14 14 4 22 4A6 6 0 0 1 26 14C26 14 19 19 14 19A8 8 0 0 1 5 14Z" fill="currentColor" />
        <path d="M19 8C19 8 13 13 9 14" fill="none" stroke={inner} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M19 21C19 21 15 26 15 28A2 2 0 0 0 19 28C19 26 19 21 19 21Z" fill="currentColor" />
        <circle cx="17.4" cy="27" r="0.9" fill={inner} />
      </g>
    ),
  },
  {
    id: "planet",
    kind: "sticker",
    category: "celestial",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="15" cy="15" r="8.5" fill="currentColor" />
        <circle cx="12" cy="12" r="2.4" fill={inner} />
        <circle cx="18" cy="17.5" r="1.5" fill={inner} />
        <ellipse cx="15" cy="15" rx="13" ry="4.4" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(-22 15 15)" />
      </g>
    ),
  },
  {
    id: "comet",
    kind: "sticker",
    category: "celestial",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M22 10L7 25" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M26 6L16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M28 12L20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="24" cy="8" r="4.6" fill="currentColor" />
        <circle cx="22.6" cy="6.6" r="1.4" fill={inner} />
      </g>
    ),
  },
  {
    id: "twinkle",
    kind: "sticker",
    category: "celestial",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 3C16.8 11.5 20.5 15.2 29 16C20.5 16.8 16.8 20.5 16 29C15.2 20.5 11.5 16.8 3 16C11.5 15.2 15.2 11.5 16 3Z" fill="currentColor" />
        <circle cx="16" cy="16" r="2.4" fill={inner} />
      </g>
    ),
  },
  {
    id: "crescent",
    kind: "sticker",
    category: "celestial",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M22 4A12 12 0 1 0 22 28A9.5 9.5 0 1 1 22 4Z" fill="currentColor" />
        <circle cx="13.5" cy="12" r="1.5" fill={inner} />
        <circle cx="12.5" cy="18" r="1.1" fill={inner} />
      </g>
    ),
  },
  {
    id: "shooting-star",
    kind: "sticker",
    category: "celestial",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M4 26L13 17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M7 27L14 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M22 4L24.4 11.6L32 14L24.4 16.4L22 24L19.6 16.4L12 14L19.6 11.6L22 4Z" fill="currentColor" transform="scale(0.78) translate(7 4)" />
        <circle cx="23" cy="13.5" r="1.8" fill={inner} />
      </g>
    ),
  },
  {
    id: "constellation",
    kind: "sticker",
    category: "celestial",
    tint: "var(--sw-ink-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M6 8L13 14L18 9L25 13L22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="8" r="2.4" fill="currentColor" />
        <circle cx="13" cy="14" r="2.4" fill="currentColor" />
        <circle cx="18" cy="9" r="2.4" fill="currentColor" />
        <circle cx="25" cy="13" r="2.4" fill="currentColor" />
        <circle cx="22" cy="22" r="2.4" fill="currentColor" />
      </g>
    ),
  },
  {
    id: "sparkle-burst",
    kind: "sticker",
    category: "celestial",
    tint: "var(--sw-accent-2)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="16" cy="16" r="3.6" fill="currentColor" />
        <line x1="16" y1="3" x2="16" y2="9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="16" y1="23" x2="16" y2="29" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="3" y1="16" x2="9" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="23" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="7.5" y1="7.5" x2="11" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="21" y1="21" x2="24.5" y2="24.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="24.5" y1="7.5" x2="21" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="11" y1="21" x2="7.5" y2="24.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="16" r="1.4" fill={inner} />
      </g>
    ),
  },
  {
    id: "heart-pair",
    kind: "sticker",
    category: "hearts",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path
          d="M12 25C12 25 3 19.4 3 13.2A4.4 4.4 0 0 1 12 11.4A4.4 4.4 0 0 1 21 13.2C21 19.4 12 25 12 25Z"
          fill="currentColor"
        />
        <path
          d="M22 18C22 18 15 13.6 15 8.8A3.5 3.5 0 0 1 22 7.4A3.5 3.5 0 0 1 29 8.8C29 13.6 22 18 22 18Z"
          fill={inner}
        />
      </g>
    ),
  },
  {
    id: "heart-arrow",
    kind: "sticker",
    category: "hearts",
    tint: "var(--sw-danger)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <line x1="3" y1="24" x2="29" y2="8" stroke={inner} strokeWidth="2" strokeLinecap="round" />
        <path d="M5 25L3 24L4 22" fill="none" stroke={inner} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="29,8 24.5,8.6 28,12.2" fill={inner} />
        <path
          d="M16 26C16 26 6 20 6 13.4A4.8 4.8 0 0 1 16 11.4A4.8 4.8 0 0 1 26 13.4C26 20 16 26 16 26Z"
          fill="currentColor"
        />
      </g>
    ),
  },
  {
    id: "heart-trio",
    kind: "sticker",
    category: "hearts",
    tint: "var(--sw-accent)",
    w: 52,
    h: 52,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path
          d="M9 14C9 14 3 10.6 3 7A2.7 2.7 0 0 1 9 6A2.7 2.7 0 0 1 15 7C15 10.6 9 14 9 14Z"
          fill={inner}
        />
        <path
          d="M23 14C23 14 17 10.6 17 7A2.7 2.7 0 0 1 23 6A2.7 2.7 0 0 1 29 7C29 10.6 23 14 23 14Z"
          fill={inner}
        />
        <path
          d="M16 29C16 29 8 23.6 8 18.4A3.9 3.9 0 0 1 16 16.8A3.9 3.9 0 0 1 24 18.4C24 23.6 16 29 16 29Z"
          fill="currentColor"
        />
      </g>
    ),
  },
  {
    id: "sparkle-heart",
    kind: "sticker",
    category: "hearts",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path
          d="M16 26C16 26 6 20 6 13.4A4.8 4.8 0 0 1 16 11.4A4.8 4.8 0 0 1 26 13.4C26 20 16 26 16 26Z"
          fill="currentColor"
        />
        <path d="M25 4L25.9 6.6L28.5 7.5L25.9 8.4L25 11L24.1 8.4L21.5 7.5L24.1 6.6Z" fill={inner} />
        <circle cx="6.5" cy="6.5" r="1.6" fill={inner} />
        <circle cx="27" cy="22" r="1.3" fill={inner} />
      </g>
    ),
  },
  {
    id: "heart-tag",
    kind: "sticker",
    category: "hearts",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <rect x="6" y="9" width="20" height="14" rx="3" fill="currentColor" />
        <circle cx="10" cy="16" r="1.6" fill="var(--sw-card)" />
        <path
          d="M19 21C19 21 13.5 17.6 13.5 14.2A2.7 2.7 0 0 1 19 13A2.7 2.7 0 0 1 24.5 14.2C24.5 17.6 19 21 19 21Z"
          fill={inner}
        />
        <line x1="10" y1="16" x2="4" y2="8" stroke={inner} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "heart-wing",
    kind: "sticker",
    category: "hearts",
    tint: "var(--sw-danger)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M11 16C7 13 4 13 2 15C5 15 5 17 8 18C5 18 5 20 3 21C6 21 9 20 11 18Z" fill={inner} />
        <path d="M21 16C25 13 28 13 30 15C27 15 27 17 24 18C27 18 27 20 29 21C26 21 23 20 21 18Z" fill={inner} />
        <path
          d="M16 27C16 27 8 21.6 8 16.4A3.9 3.9 0 0 1 16 14.8A3.9 3.9 0 0 1 24 16.4C24 21.6 16 27 16 27Z"
          fill="currentColor"
        />
      </g>
    ),
  },
  {
    id: "pumpkin",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <ellipse cx="16" cy="19" rx="11" ry="9" fill="currentColor" />
        <ellipse cx="10" cy="19" rx="4" ry="8.4" fill={inner} />
        <ellipse cx="22" cy="19" rx="4" ry="8.4" fill={inner} />
        <path d="M16 10V6" fill="none" stroke="var(--sw-done)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "holly",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-done)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 7C12 9 10 11 6 12 10 13 12 15 16 17 20 15 22 13 26 12 22 11 20 9 16 7Z" fill="currentColor" />
        <path d="M16 14C13 16 11 17 7 18 11 19 13 21 16 23 19 21 21 19 25 18 21 17 19 16 16 14Z" fill="currentColor" />
        <circle cx="13.5" cy="24" r="2.2" fill="var(--sw-danger)" />
        <circle cx="18.5" cy="24" r="2.2" fill="var(--sw-danger)" />
        <circle cx="16" cy="26.4" r="2.2" fill="var(--sw-danger)" />
      </g>
    ),
  },
  {
    id: "snowman",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-ink-3)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="16" cy="21" r="8" fill="currentColor" />
        <circle cx="16" cy="10" r="5.6" fill="currentColor" />
        <circle cx="14" cy="9" r="1" fill={inner} />
        <circle cx="18" cy="9" r="1" fill={inner} />
        <polygon points="16,11 21,12 16,13" fill="var(--sw-accent)" />
        <circle cx="16" cy="19" r="1.1" fill={inner} />
        <circle cx="16" cy="23" r="1.1" fill={inner} />
      </g>
    ),
  },
  {
    id: "maple-leaf",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 4 18 9 22 7 21 11 26 11 22 14 27 17 21 17 22 21 18 19 16 24 14 19 10 21 11 17 5 17 10 14 6 11 11 11 10 7 14 9Z" fill="currentColor" />
        <path d="M16 24V14" fill="none" stroke={inner} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "gift",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <rect x="6" y="13" width="20" height="13" rx="2" fill="currentColor" />
        <rect x="5" y="9" width="22" height="5" rx="1.6" fill="currentColor" />
        <rect x="14" y="9" width="4" height="17" fill={inner} />
        <path d="M16 9C16 9 13 4 10 6 8 7.4 11 9 16 9Z" fill="currentColor" />
        <path d="M16 9C16 9 19 4 22 6 24 7.4 21 9 16 9Z" fill="currentColor" />
      </g>
    ),
  },
  {
    id: "candle",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-ink-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <rect x="11" y="12" width="10" height="16" rx="3" fill="currentColor" />
        <rect x="13.6" y="12" width="2.2" height="16" rx="1" fill={inner} />
        <line x1="16" y1="12" x2="16" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 9C18 6.6 18 5 16 3 14 5 14 6.6 16 9Z" fill="var(--sw-accent)" />
        <ellipse cx="16" cy="6.6" rx="0.9" ry="1.6" fill="var(--sw-accent-2)" />
      </g>
    ),
  },
  {
    id: "ornament",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-danger)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <circle cx="16" cy="19" r="9.4" fill="currentColor" />
        <path d="M8 16C12 18 20 18 24 16" fill="none" stroke={inner} strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="12.6" cy="15" rx="2" ry="3" fill={inner} />
        <rect x="14" y="6" width="4" height="4" rx="1" fill="var(--sw-accent-2)" />
        <path d="M16 6V3" fill="none" stroke="var(--sw-ink-3)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "snow-tree",
    kind: "sticker",
    category: "seasonal",
    tint: "var(--sw-done)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <rect x="14" y="24" width="4" height="4" rx="1" fill="var(--sw-ink-2)" />
        <polygon points="16,4 23,13 9,13" fill="currentColor" />
        <polygon points="16,10 25,21 7,21" fill="currentColor" />
        <circle cx="16" cy="4" r="1.6" fill="var(--sw-accent-2)" />
        <circle cx="12" cy="19" r="1.3" fill={inner} />
        <circle cx="20" cy="17" r="1.3" fill={inner} />
        <circle cx="16" cy="15" r="1.3" fill={inner} />
      </g>
    ),
  },
  {
    id: "cottage",
    kind: "sticker",
    category: "scene",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <polygon points="16 4 28 14 4 14" fill="currentColor" />
        <rect x="7" y="14" width="18" height="13" rx="1.5" fill="currentColor" />
        <rect x="13.5" y="19" width="5" height="8" rx="1" fill={inner} />
        <rect x="9" y="17" width="3.5" height="3.5" rx="0.8" fill="var(--sw-card)" />
        <rect x="19.5" y="17" width="3.5" height="3.5" rx="0.8" fill="var(--sw-card)" />
      </g>
    ),
  },
  {
    id: "tent",
    kind: "sticker",
    category: "scene",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <polygon points="16 5 27 26 5 26" fill="currentColor" />
        <polygon points="16 5 21 26 11 26" fill={inner} />
        <polygon points="16 13 20 26 12 26" fill="var(--sw-card)" />
        <line x1="16" y1="5" x2="16" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "hot-air-balloon",
    kind: "sticker",
    category: "scene",
    tint: "var(--sw-danger)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 4C10.5 4 7 8 7 13C7 18 11 20 16 20C21 20 25 18 25 13C25 8 21.5 4 16 4Z" fill="currentColor" />
        <path d="M16 4C13 4 12 8 12 13C12 17 13.5 20 16 20C18.5 20 20 17 20 13C20 8 19 4 16 4Z" fill={inner} />
        <line x1="13" y1="19" x2="14" y2="24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="19" y1="19" x2="18" y2="24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="13.5" y="24" width="5" height="4" rx="1" fill="var(--sw-ink-3)" />
      </g>
    ),
  },
  {
    id: "sailboat",
    kind: "sticker",
    category: "scene",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M5 22H27L24 27H8L5 22Z" fill="var(--sw-ink-3)" />
        <line x1="16" y1="5" x2="16" y2="21" stroke="var(--sw-ink-3)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 6L24 20H16Z" fill="currentColor" />
        <path d="M15 7L8 20H15Z" fill={inner} />
      </g>
    ),
  },
  {
    id: "mountain",
    kind: "sticker",
    category: "scene",
    tint: "var(--sw-ink-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <polygon points="11 8 22 26 0.5 26" transform="translate(2.5 0)" fill="currentColor" />
        <polygon points="22 12 30 26 14 26" fill={inner} />
        <polygon points="13.5 12 10 18 17 18" fill="var(--sw-card)" />
      </g>
    ),
  },
  {
    id: "campfire",
    kind: "sticker",
    category: "scene",
    tint: "var(--sw-accent)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 4C20 8 21 11 21 15C21 19 19 22 16 22C13 22 11 19 11 15C11 12 13 9 16 4Z" fill="currentColor" />
        <path d="M16 11C18 13 18.5 15 18.5 17C18.5 19.5 17.4 21 16 21C14.6 21 13.5 19.5 13.5 17C13.5 15 14 13 16 11Z" fill={inner} />
        <line x1="8" y1="28" x2="24" y2="24" stroke="var(--sw-ink-3)" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="24" y1="28" x2="8" y2="24" stroke="var(--sw-ink-3)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "lantern",
    kind: "sticker",
    category: "scene",
    tint: "var(--sw-accent-2)",
    w: 54,
    h: 54,
    viewBox: "0 0 32 32",
    body: (
      <g>
        <path d="M16 3C18 3 19 4.5 19 6H13C13 4.5 14 3 16 3Z" fill="var(--sw-ink-3)" />
        <line x1="16" y1="6" x2="16" y2="8" stroke="var(--sw-ink-3)" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="9" y="8" width="14" height="4" rx="1.5" fill="var(--sw-ink-3)" />
        <rect x="9" y="24" width="14" height="4" rx="1.5" fill="var(--sw-ink-3)" />
        <rect x="10.5" y="12" width="11" height="12" rx="2" fill="currentColor" />
        <ellipse cx="16" cy="18" rx="3" ry="4" fill={inner} />
      </g>
    ),
  },
];

export const DECORATION_KINDS: DecorationKind[] = ["sticker", "washi", "doodle"];

export const DECORATIONS: DecorationAsset[] = [
  ...INLINE_DECORATIONS,
  ...DROPPED_DECORATIONS,
];

const BY_ID = new Map(DECORATIONS.map((asset) => [asset.id, asset]));

export const decorationById = (id: string): DecorationAsset | undefined =>
  BY_ID.get(id);

export const isDecorationKind = (value: string): value is DecorationKind =>
  value === "sticker" || value === "washi" || value === "doodle";
