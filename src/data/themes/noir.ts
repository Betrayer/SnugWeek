import type { MantineColorsTuple } from "@mantine/core";
import type { ThemeSpec } from "./types.ts";

const dark: MantineColorsTuple = [
  "#ededed",
  "#cfcfcf",
  "#a8a8a8",
  "#7d7d7d",
  "#4a4a4a",
  "#363636",
  "#2a2a2a",
  "#202020",
  "#1a1a1a",
  "#141414",
];

export const noir: ThemeSpec = {
  id: "noir",
  kind: "dark",
  vars: {
    "--sw-paper": "#161616",
    "--sw-paper-2": "#1e1e1e",
    "--sw-card": "#242424",
    "--sw-ink": "#ededed",
    "--sw-ink-2": "#b0b0b0",
    "--sw-ink-3": "#888888",
    "--sw-line": "#383838",
    "--sw-accent": "#e8e8e8",
    "--sw-accent-2": "#ffffff",
    "--sw-accent-ink": "#1a1a1a",
    "--sw-highlight": "#2c2c2c",
    "--sw-done": "#b5b5b5",
    "--sw-danger": "#d98a78",
    "--sw-shadow": "0 4px 16px rgba(0, 0, 0, 0.5)",
    "--sw-fold-shade": "rgba(0, 0, 0, 0.65)",
    "--sw-paper-texture": "none",
    "--sw-font-body": "'Nunito', 'Segoe UI', system-ui, sans-serif",
    "--sw-font-hand": "'Caveat', cursive",
  },
  mantine: { colors: { dark } },
  preview: { paper: "#161616", accent: "#e8e8e8", ink: "#ededed" },
};
