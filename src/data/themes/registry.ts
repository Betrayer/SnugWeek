import { lavender } from "./lavender.ts";
import { midnight } from "./midnight.ts";
import { milk } from "./milk.ts";
import { peach } from "./peach.ts";
import { sage } from "./sage.ts";
import type { ThemeSpec } from "./types.ts";

export const THEMES: Record<string, ThemeSpec> = {
  milk,
  lavender,
  sage,
  peach,
  midnight,
};

export const THEME_ORDER = ["milk", "lavender", "sage", "peach", "midnight"];

export const DEFAULT_THEME_ID = "milk";

export const themeById = (id: string): ThemeSpec => THEMES[id] ?? milk;
