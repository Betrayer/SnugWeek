export interface CoverStyle {
  id: string;
  background: string;
}

export const COVERS: CoverStyle[] = [
  { id: "plain", background: "var(--sw-paper)" },
  {
    id: "cream",
    background:
      "linear-gradient(180deg, var(--sw-paper) 0%, var(--sw-paper-2) 100%)",
  },
  {
    id: "accent",
    background:
      "linear-gradient(135deg, var(--sw-accent) 0%, var(--sw-accent-2) 100%)",
  },
  {
    id: "blush",
    background:
      "linear-gradient(160deg, var(--sw-highlight) 0%, var(--sw-card) 72%)",
  },
  {
    id: "dots",
    background:
      "radial-gradient(var(--sw-line) 1.4px, transparent 1.6px) 0 0 / 16px 16px, var(--sw-paper)",
  },
  {
    id: "grid",
    background:
      "linear-gradient(var(--sw-line) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, var(--sw-line) 1px, transparent 1px) 0 0 / 22px 22px, var(--sw-paper)",
  },
  {
    id: "stripes",
    background:
      "repeating-linear-gradient(45deg, var(--sw-paper-2) 0 10px, var(--sw-paper) 10px 22px)",
  },
];

export const COVER_IDS = COVERS.map((cover) => cover.id);

export const DEFAULT_COVER_ID = "plain";

const BY_ID = new Map(COVERS.map((cover) => [cover.id, cover]));

export const coverBackground = (id: string | null): string | undefined => {
  if (!id || id === DEFAULT_COVER_ID) return undefined;
  return BY_ID.get(id)?.background;
};
