import { cocoa } from "./cocoa.ts";
import { lavender } from "./lavender.ts";
import { midnight } from "./midnight.ts";
import { milk } from "./milk.ts";
import { mono } from "./mono.ts";
import { noir } from "./noir.ts";
import { peach } from "./peach.ts";
import { sage } from "./sage.ts";
import { sky } from "./sky.ts";
import { snow } from "./snow.ts";
import type { ThemeSpec } from "./types.ts";

export const THEMES: Record<string, ThemeSpec> = {
  milk,
  lavender,
  sage,
  peach,
  midnight,
  snow,
  mono,
  noir,
  sky,
  cocoa,
};

export interface ThemeGroup {
  id: string;
  themeIds: string[];
}

export const THEME_GROUPS: ThemeGroup[] = [
  { id: "light", themeIds: ["milk", "peach", "cocoa"] },
  { id: "colorful", themeIds: ["sky", "lavender", "sage"] },
  { id: "minimal", themeIds: ["snow", "mono"] },
  { id: "dark", themeIds: ["midnight", "noir"] },
];

export const THEME_ORDER = THEME_GROUPS.flatMap((group) => group.themeIds);

export const DEFAULT_THEME_ID = "milk";

export const themeById = (id: string): ThemeSpec => THEMES[id] ?? milk;
