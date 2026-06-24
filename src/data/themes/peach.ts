import type { ThemeSpec } from "./types.ts";

export const peach: ThemeSpec = {
  id: "peach",
  kind: "light",
  vars: {
    "--sw-paper": "#fdf3ee",
    "--sw-paper-2": "#f9e6db",
    "--sw-off-day": "#f8ddc9",
    "--sw-card": "#fffcf9",
    "--sw-ink": "#4e3d34",
    "--sw-ink-2": "#79604f",
    "--sw-ink-3": "#b49a8b",
    "--sw-line": "#f0dccf",
    "--sw-accent": "#e08868",
    "--sw-accent-2": "#bb6240",
    "--sw-accent-ink": "#43332a",
    "--sw-highlight": "#fbe6c4",
    "--sw-done": "#a8bd86",
    "--sw-danger": "#c75b4a",
    "--sw-shadow": "0 2px 10px rgba(110, 70, 50, 0.1)",
    "--sw-fold-shade": "rgba(70, 40, 24, 0.3)",
    "--sw-paper-texture": "none",
  },
  mantine: {},
  preview: { paper: "#fdf3ee", accent: "#e08868", ink: "#4e3d34" },
};
