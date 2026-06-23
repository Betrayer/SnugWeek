import type { ThemeSpec } from "./types.ts";

export const lavender: ThemeSpec = {
  id: "lavender",
  kind: "light",
  vars: {
    "--sw-paper": "#f6f4fb",
    "--sw-paper-2": "#ece7f5",
    "--sw-off-day": "#e6ddf3",
    "--sw-card": "#fefcff",
    "--sw-ink": "#423a52",
    "--sw-ink-2": "#6f6582",
    "--sw-ink-3": "#a79eb8",
    "--sw-line": "#e3dcef",
    "--sw-accent": "#9a86c9",
    "--sw-accent-2": "#7d6bb0",
    "--sw-accent-ink": "#fffbff",
    "--sw-highlight": "#f1e8d4",
    "--sw-done": "#9bbb96",
    "--sw-danger": "#c4705f",
    "--sw-shadow": "0 2px 10px rgba(70, 58, 92, 0.1)",
    "--sw-fold-shade": "rgba(45, 33, 64, 0.3)",
    "--sw-paper-texture": "none",
  },
  mantine: {},
  preview: { paper: "#f6f4fb", accent: "#9a86c9", ink: "#423a52" },
};
