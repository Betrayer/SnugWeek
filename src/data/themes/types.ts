import type { MantineThemeOverride } from "@mantine/core";

export interface ThemeSpec {
  id: string;
  kind: "light" | "dark";
  vars: Record<string, string>;
  mantine: MantineThemeOverride;
  preview: { paper: string; accent: string; ink: string };
}
