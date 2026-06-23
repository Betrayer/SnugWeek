import type { ThemeSpec } from "./types.ts";

export const sage: ThemeSpec = {
  id: "sage",
  kind: "light",
  vars: {
    "--sw-paper": "#f3f6f1",
    "--sw-paper-2": "#e6ede1",
    "--sw-off-day": "#dde9d4",
    "--sw-card": "#fcfdfb",
    "--sw-ink": "#3b443a",
    "--sw-ink-2": "#667064",
    "--sw-ink-3": "#9aa597",
    "--sw-line": "#dbe5d5",
    "--sw-accent": "#5f9488",
    "--sw-accent-2": "#4d7c71",
    "--sw-accent-ink": "#f8fdfb",
    "--sw-highlight": "#f0ead3",
    "--sw-done": "#a8bd86",
    "--sw-danger": "#c4705f",
    "--sw-shadow": "0 2px 10px rgba(56, 70, 52, 0.09)",
    "--sw-fold-shade": "rgba(38, 50, 34, 0.3)",
    "--sw-paper-texture": "none",
  },
  mantine: {},
  preview: { paper: "#f3f6f1", accent: "#5f9488", ink: "#3b443a" },
};
