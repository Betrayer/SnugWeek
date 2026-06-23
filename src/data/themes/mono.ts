import type { ThemeSpec } from "./types.ts";

export const mono: ThemeSpec = {
  id: "mono",
  kind: "light",
  vars: {
    "--sw-paper": "#f6f6f5",
    "--sw-paper-2": "#ececeb",
    "--sw-off-day": "#e4e3e0",
    "--sw-card": "#ffffff",
    "--sw-ink": "#2b2b2b",
    "--sw-ink-2": "#5c5c5c",
    "--sw-ink-3": "#919191",
    "--sw-line": "#e2e2e0",
    "--sw-accent": "#3a3a3a",
    "--sw-accent-2": "#1f1f1f",
    "--sw-accent-ink": "#f4f4f4",
    "--sw-highlight": "#e8e7e3",
    "--sw-done": "#8c8c8c",
    "--sw-danger": "#b46656",
    "--sw-shadow": "0 2px 10px rgba(0, 0, 0, 0.06)",
    "--sw-fold-shade": "rgba(0, 0, 0, 0.25)",
    "--sw-paper-texture": "none",
  },
  mantine: {},
  preview: { paper: "#f6f6f5", accent: "#3a3a3a", ink: "#2b2b2b" },
};
