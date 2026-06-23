import type { FontSpec } from "./types.ts";

const SANS_FALLBACK = '"Segoe UI", system-ui, sans-serif';
const SERIF_FALLBACK = "Georgia, Cambria, serif";
const HAND_FALLBACK = "cursive";

const nunito: FontSpec = {
  id: "nunito",
  name: "Nunito",
  slot: "body",
  stack: `"Nunito", ${SANS_FALLBACK}`,
  preload: ["/fonts/nunito-latin-400.woff2", "/fonts/nunito-cyrillic-400.woff2"],
};

const comfortaa: FontSpec = {
  id: "comfortaa",
  name: "Comfortaa",
  slot: "body",
  stack: `"Comfortaa", ${SANS_FALLBACK}`,
  preload: [
    "/fonts/comfortaa-latin.woff2",
    "/fonts/comfortaa-cyrillic.woff2",
  ],
};

const lora: FontSpec = {
  id: "lora",
  name: "Lora",
  slot: "body",
  stack: `"Lora", ${SERIF_FALLBACK}`,
  preload: ["/fonts/lora-latin.woff2", "/fonts/lora-cyrillic.woff2"],
};

const caveat: FontSpec = {
  id: "caveat",
  name: "Caveat",
  slot: "hand",
  stack: `"Caveat", ${HAND_FALLBACK}`,
  preload: [
    "/fonts/caveat-latin-600.woff2",
    "/fonts/caveat-cyrillic-600.woff2",
  ],
};

const marck: FontSpec = {
  id: "marck",
  name: "Marck Script",
  slot: "hand",
  stack: `"Marck Script", ${HAND_FALLBACK}`,
  preload: [
    "/fonts/marck-script-latin.woff2",
    "/fonts/marck-script-cyrillic.woff2",
  ],
};

export const BODY_FONTS: FontSpec[] = [nunito, comfortaa, lora];
export const HAND_FONTS: FontSpec[] = [caveat, marck];

export const DEFAULT_BODY_FONT_ID = nunito.id;
export const DEFAULT_HAND_FONT_ID = caveat.id;

export const bodyFontById = (id: string): FontSpec =>
  BODY_FONTS.find((font) => font.id === id) ?? nunito;

export const handFontById = (id: string): FontSpec =>
  HAND_FONTS.find((font) => font.id === id) ?? caveat;

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
  const body = bodyFontById(bodyId);
  const hand = handFontById(handId);
  return {
    body: scope === "onlyTasks" ? nunito.stack : body.stack,
    hand: hand.stack,
    tasks: scope === "exceptTasks" ? nunito.stack : body.stack,
    preload: [...body.preload, ...hand.preload],
  };
};
