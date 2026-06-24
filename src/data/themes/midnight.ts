import type { MantineColorsTuple } from "@mantine/core";
import type { ThemeSpec } from "./types.ts";

const dark: MantineColorsTuple = [
  "#e8e2d6",
  "#d8d1c3",
  "#bbb3a4",
  "#948c7d",
  "#5c616d",
  "#454a57",
  "#2f3441",
  "#262b35",
  "#1f232c",
  "#181b22",
];

export const midnight: ThemeSpec = {
  id: "midnight",
  kind: "dark",
  vars: {
    "--sw-paper": "#1c1f27",
    "--sw-paper-2": "#242833",
    "--sw-off-day": "#343029",
    "--sw-card": "#2a2f3b",
    "--sw-ink": "#e8e2d6",
    "--sw-ink-2": "#b3ab9c",
    "--sw-ink-3": "#948c7d",
    "--sw-line": "#3a3f4c",
    "--sw-accent": "#e3ad6f",
    "--sw-accent-2": "#f0bf86",
    "--sw-accent-ink": "#241c12",
    "--sw-highlight": "#3a3322",
    "--sw-done": "#9cc394",
    "--sw-danger": "#e08a7a",
    "--sw-shadow": "0 4px 16px rgba(0, 0, 0, 0.4)",
    "--sw-fold-shade": "rgba(0, 0, 0, 0.55)",
    "--sw-paper-texture": "none",
  },
  mantine: { colors: { dark } },
  preview: { paper: "#1c1f27", accent: "#e3ad6f", ink: "#e8e2d6" },
};
