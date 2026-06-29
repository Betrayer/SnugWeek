import type { ThemeCategory, ThemeSpec } from "./types.ts";

const modules = import.meta.glob<Record<string, unknown>>(
  ["./*.ts", "!./registry.ts", "!./types.ts"],
  { eager: true },
);

const isThemeSpec = (value: unknown): value is ThemeSpec =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  "vars" in value &&
  "category" in value;

const collected: ThemeSpec[] = Object.values(modules).flatMap((module) =>
  Object.values(module).filter(isThemeSpec),
);

export const THEMES: Record<string, ThemeSpec> = Object.fromEntries(
  collected.map((theme) => [theme.id, theme]),
);

const CATEGORY_ORDER: ThemeCategory[] = [
  "light",
  "colorful",
  "minimal",
  "warm",
  "dark",
];

const byOrder = (a: ThemeSpec, b: ThemeSpec): number =>
  (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name);

export interface ThemeGroup {
  id: ThemeCategory;
  themeIds: string[];
}

export const THEME_GROUPS: ThemeGroup[] = CATEGORY_ORDER.map((category) => ({
  id: category,
  themeIds: collected
    .filter((theme) => theme.category === category)
    .sort(byOrder)
    .map((theme) => theme.id),
})).filter((group) => group.themeIds.length > 0);

export const THEME_ORDER = THEME_GROUPS.flatMap((group) => group.themeIds);

export const DEFAULT_THEME_ID = "milk";

export const themeById = (id: string): ThemeSpec =>
  THEMES[id] ?? THEMES[DEFAULT_THEME_ID]!;
