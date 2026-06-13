import { createTheme, mergeThemeOverrides } from "@mantine/core";
import type { MantineColorsTuple, MantineThemeOverride } from "@mantine/core";
import type { ThemeSpec } from "../data/themes/types.ts";

interface Hsl {
  h: number;
  s: number;
  l: number;
}

const hexToHsl = (hex: string): Hsl => {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === r
      ? ((g - b) / d) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
};

const channelToHex = (value: number): string =>
  Math.round(Math.min(Math.max(value, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");

const hslToHex = ({ h, s, l }: Hsl): string => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const sector = Math.floor(h / 60) % 6;
  const rgb: [number, number, number] =
    sector === 0
      ? [c, x, 0]
      : sector === 1
        ? [x, c, 0]
        : sector === 2
          ? [0, c, x]
          : sector === 3
            ? [0, x, c]
            : sector === 4
              ? [x, 0, c]
              : [c, 0, x];
  const [r, g, b] = rgb;
  return `#${channelToHex(r + m)}${channelToHex(g + m)}${channelToHex(b + m)}`;
};

const withLightness = (base: Hsl, l: number): string =>
  hslToHex({ ...base, l });

const accentColors = (accent: string): MantineColorsTuple => {
  const base = hexToHsl(accent);
  return [
    withLightness(base, 0.96),
    withLightness(base, 0.91),
    withLightness(base, 0.85),
    withLightness(base, 0.78),
    withLightness(base, 0.72),
    withLightness(base, 0.67),
    accent,
    withLightness(base, Math.max(base.l - 0.12, 0.22)),
    withLightness(base, Math.max(base.l - 0.22, 0.16)),
    withLightness(base, Math.max(base.l - 0.3, 0.12)),
  ];
};

export const buildMantineTheme = (spec: ThemeSpec): MantineThemeOverride => {
  const accent = spec.vars["--sw-accent"] ?? spec.preview.accent;
  const base = createTheme({
    fontFamily: "var(--sw-font-body)",
    headings: { fontFamily: "var(--sw-font-body)", fontWeight: "700" },
    defaultRadius: "lg",
    primaryColor: "snug",
    colors: { snug: accentColors(accent) },
    components: {
      Paper: {
        styles: { root: { backgroundColor: "var(--sw-card)" } },
      },
      Card: {
        styles: { root: { backgroundColor: "var(--sw-card)" } },
      },
    },
  });
  return mergeThemeOverrides(base, spec.mantine);
};
