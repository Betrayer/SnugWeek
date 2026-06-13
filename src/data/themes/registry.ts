import { milk } from "./milk.ts";
import type { ThemeSpec } from "./types.ts";

export const THEMES: Record<string, ThemeSpec> = { milk };

export const DEFAULT_THEME_ID = "milk";

export const themeById = (id: string): ThemeSpec => THEMES[id] ?? milk;
