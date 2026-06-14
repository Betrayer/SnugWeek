import { DEFAULT_LANGUAGE } from "../i18n/languages.ts";
import type { SupportedLang } from "../i18n/languages.ts";

export interface SeedContent {
  tasks: string[];
  habit: string;
  habitIcon: string;
  mood: string;
}

const SEED: Record<SupportedLang, SeedContent> = {
  uk: {
    tasks: [
      "Спланувати тиждень ✨",
      "Випити води 💧",
      "Маленька прогулянка",
      "Відпочити без екрана",
    ],
    habit: "Прогулянка",
    habitIcon: "leaf",
    mood: "🙂",
  },
  en: {
    tasks: [
      "Plan the week ✨",
      "Drink water 💧",
      "A little walk",
      "Screen-free break",
    ],
    habit: "Walk",
    habitIcon: "leaf",
    mood: "🙂",
  },
};

export const seedContentFor = (lang: SupportedLang): SeedContent =>
  SEED[lang] ?? SEED[DEFAULT_LANGUAGE];
