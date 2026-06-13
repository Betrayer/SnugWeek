export const SUPPORTED_LANGS = ["uk", "en"] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANGUAGE: SupportedLang = "uk";

export const isSupportedLang = (value: unknown): value is SupportedLang =>
  typeof value === "string" && SUPPORTED_LANGS.some((lang) => lang === value);
