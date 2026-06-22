import type { ThemeSpec } from "./types.ts";

export const cocoa: ThemeSpec = {
  id: "cocoa",
  kind: "light",
  vars: {
    "--sw-paper": "#f6efe6",
    "--sw-paper-2": "#ebdfcf",
    "--sw-off-day": "#e7d4b8",
    "--sw-card": "#fdf8f1",
    "--sw-ink": "#3f3329",
    "--sw-ink-2": "#6f5d4c",
    "--sw-ink-3": "#a8937d",
    "--sw-line": "#e4d6c2",
    "--sw-accent": "#b07636",
    "--sw-accent-2": "#8f5d28",
    "--sw-accent-ink": "#fff7ec",
    "--sw-highlight": "#f3e2c0",
    "--sw-done": "#a6b884",
    "--sw-danger": "#c4705f",
    "--sw-shadow": "0 2px 10px rgba(90, 66, 40, 0.1)",
    "--sw-fold-shade": "rgba(66, 46, 26, 0.3)",
    "--sw-paper-texture": "none",
    "--sw-font-body": "'Nunito', 'Segoe UI', system-ui, sans-serif",
    "--sw-font-hand": "'Caveat', cursive",
  },
  mantine: {},
  preview: { paper: "#f6efe6", accent: "#b07636", ink: "#3f3329" },
};
