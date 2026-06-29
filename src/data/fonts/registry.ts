import type { FontSpec } from "./types.ts";

const SANS_FALLBACK = '"Segoe UI", system-ui, sans-serif';
const SERIF_FALLBACK = "Georgia, Cambria, serif";
const HAND_FALLBACK = "cursive";

const nunito: FontSpec = {
  id: "nunito",
  name: "Nunito",
  stack: `"Nunito", ${SANS_FALLBACK}`,
  preload: ["/fonts/nunito-latin-400.woff2", "/fonts/nunito-cyrillic-400.woff2"],
};

const rubik: FontSpec = {
  id: "rubik",
  name: "Rubik",
  stack: `"Rubik", ${SANS_FALLBACK}`,
  preload: ["/fonts/rubik-latin.woff2", "/fonts/rubik-cyrillic.woff2"],
};

const comfortaa: FontSpec = {
  id: "comfortaa",
  name: "Comfortaa",
  stack: `"Comfortaa", ${SANS_FALLBACK}`,
  preload: ["/fonts/comfortaa-latin.woff2", "/fonts/comfortaa-cyrillic.woff2"],
};

const sourceSans: FontSpec = {
  id: "sourceSans",
  name: "Source Sans 3",
  stack: `"Source Sans 3", ${SANS_FALLBACK}`,
  preload: [
    "/fonts/source-sans-3-latin.woff2",
    "/fonts/source-sans-3-cyrillic.woff2",
  ],
};

const inter: FontSpec = {
  id: "inter",
  name: "Inter",
  stack: `"Inter", ${SANS_FALLBACK}`,
  preload: ["/fonts/inter-latin.woff2", "/fonts/inter-cyrillic.woff2"],
};

const lora: FontSpec = {
  id: "lora",
  name: "Lora",
  stack: `"Lora", ${SERIF_FALLBACK}`,
  preload: ["/fonts/lora-latin.woff2", "/fonts/lora-cyrillic.woff2"],
};

const pangolin: FontSpec = {
  id: "pangolin",
  name: "Pangolin",
  stack: `"Pangolin", ${HAND_FALLBACK}`,
  preload: ["/fonts/pangolin-latin.woff2", "/fonts/pangolin-cyrillic.woff2"],
};

const neucha: FontSpec = {
  id: "neucha",
  name: "Neucha",
  stack: `"Neucha", ${HAND_FALLBACK}`,
  preload: ["/fonts/neucha-latin.woff2", "/fonts/neucha-cyrillic.woff2"],
};

const caveat: FontSpec = {
  id: "caveat",
  name: "Caveat",
  stack: `"Caveat", ${HAND_FALLBACK}`,
  preload: ["/fonts/caveat-latin-600.woff2", "/fonts/caveat-cyrillic-600.woff2"],
};

const marck: FontSpec = {
  id: "marck",
  name: "Marck Script",
  stack: `"Marck Script", ${HAND_FALLBACK}`,
  preload: [
    "/fonts/marck-script-latin.woff2",
    "/fonts/marck-script-cyrillic.woff2",
  ],
};

const amatic: FontSpec = {
  id: "amatic",
  name: "Amatic SC",
  stack: `"Amatic SC", ${HAND_FALLBACK}`,
  preload: [
    "/fonts/amatic-sc-latin.woff2",
    "/fonts/amatic-sc-cyrillic.woff2",
  ],
};

export const FONTS: FontSpec[] = [
  nunito,
  rubik,
  comfortaa,
  sourceSans,
  inter,
  lora,
  pangolin,
  neucha,
  caveat,
  marck,
  amatic,
];

export const DEFAULT_BODY_FONT_ID = nunito.id;
export const DEFAULT_HAND_FONT_ID = caveat.id;

export const fontById = (id: string): FontSpec | undefined =>
  FONTS.find((font) => font.id === id);

export type FontScope = "all" | "exceptTasks" | "onlyTasks";

export const FONT_SCOPES: FontScope[] = ["all", "exceptTasks", "onlyTasks"];

export const DEFAULT_FONT_SCOPE: FontScope = "all";

export interface ResolvedFontVars {
  body: string;
  hand: string;
  tasks: string;
  preload: string[];
}

export const resolveFontVars = (
  bodyId: string,
  handId: string,
  scope: FontScope,
): ResolvedFontVars => {
  const body = fontById(bodyId) ?? nunito;
  const hand = fontById(handId) ?? caveat;
  return {
    body: scope === "onlyTasks" ? nunito.stack : body.stack,
    hand: hand.stack,
    tasks: scope === "exceptTasks" ? nunito.stack : body.stack,
    preload: [...body.preload, ...hand.preload],
  };
};
