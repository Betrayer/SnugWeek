import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import type { SupportedLang } from "./languages.ts";

type LocaleModule = { default: Record<string, unknown> };

const bundleLoaders = import.meta.glob<LocaleModule>("../locales/*/*.json");

const BUNDLE_PATH = /\/locales\/([^/]+)\/([^/]+)\.json$/;

const loadLanguageBundles = async (language: SupportedLang): Promise<void> => {
  const pending: Promise<void>[] = [];
  for (const [path, load] of Object.entries(bundleLoaders)) {
    const match = BUNDLE_PATH.exec(path);
    const lang = match?.[1];
    const namespace = match?.[2];
    if (lang !== language || namespace === undefined) continue;
    pending.push(
      load().then((bundle) => {
        i18next.addResourceBundle(
          language,
          namespace,
          bundle.default,
          true,
          true,
        );
      }),
    );
  }
  await Promise.all(pending);
};

let initPromise: Promise<void> | null = null;

const init = async (language: SupportedLang): Promise<void> => {
  await i18next.use(initReactI18next).init({
    lng: language,
    fallbackLng: false,
    defaultNS: "common",
    resources: {},
    interpolation: { escapeValue: false },
  });
  await loadLanguageBundles(language);
};

export const initI18n = (language: SupportedLang): Promise<void> => {
  initPromise ??= init(language);
  return initPromise;
};

export const changeI18nLanguage = async (
  language: SupportedLang,
): Promise<void> => {
  await loadLanguageBundles(language);
  await i18next.changeLanguage(language);
};
