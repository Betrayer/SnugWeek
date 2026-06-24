export type DecorationCategory =
  | "hearts"
  | "celestial"
  | "weather"
  | "plants"
  | "animals"
  | "food"
  | "seasonal"
  | "scene"
  | "misc"
  | "washi"
  | "doodle";

export const DECORATION_CATEGORIES: DecorationCategory[] = [
  "hearts",
  "celestial",
  "weather",
  "plants",
  "animals",
  "food",
  "seasonal",
  "scene",
  "misc",
  "washi",
  "doodle",
];

export const isDecorationCategory = (
  value: string,
): value is DecorationCategory =>
  (DECORATION_CATEGORIES as string[]).includes(value);
