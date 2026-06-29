import type { MantineThemeOverride } from "@mantine/core";

export type ThemeCategory =
  | "light"
  | "colorful"
  | "minimal"
  | "warm"
  | "dark";

export interface ThemeSpec {
  id: string;
  name: string;
  category: ThemeCategory;
  kind: "light" | "dark";
  order?: number;
  vars: Record<string, string>;
  mantine: MantineThemeOverride;
  preview: { paper: string; accent: string; ink: string };
}
