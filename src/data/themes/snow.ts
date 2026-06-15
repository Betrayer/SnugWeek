import type { ThemeSpec } from "./types.ts";

export const snow: ThemeSpec = {
  id: "snow",
  kind: "light",
  vars: {
    "--sw-paper": "#fcfcfb",
    "--sw-paper-2": "#f3f3f0",
    "--sw-card": "#ffffff",
    "--sw-ink": "#33312e",
    "--sw-ink-2": "#6b6862",
    "--sw-ink-3": "#a6a39c",
    "--sw-line": "#e9e8e3",
    "--sw-accent": "#a87f87",
    "--sw-accent-2": "#895f68",
    "--sw-accent-ink": "#fffafb",
    "--sw-highlight": "#f1ebe0",
    "--sw-done": "#a0b596",
    "--sw-danger": "#c4705f",
    "--sw-shadow": "0 2px 10px rgba(60, 55, 50, 0.06)",
    "--sw-fold-shade": "rgba(45, 42, 38, 0.25)",
    "--sw-paper-texture": "none",
    "--sw-font-body": "'Nunito', 'Segoe UI', system-ui, sans-serif",
    "--sw-font-hand": "'Caveat', cursive",
  },
  mantine: {},
  preview: { paper: "#fcfcfb", accent: "#a87f87", ink: "#33312e" },
};
