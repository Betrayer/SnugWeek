import { Center, MantineProvider, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME_ID, themeById } from "../data/themes/registry.ts";
import { initI18n } from "../i18n/index.ts";
import { DEFAULT_LANGUAGE, isSupportedLang } from "../i18n/languages.ts";
import { getShare } from "../services/share/shareService.ts";
import type { ShareDoc } from "../services/share/shareTypes.ts";
import { setTimeLocale } from "../services/time.ts";
import { buildMantineTheme } from "../shell/theme.ts";
import { PublicMissing } from "./PublicMissing.tsx";
import { PublicShareView } from "./PublicShareView.tsx";

type Status = "loading" | "ready" | "missing" | "error";

const PublicSplash = () => (
  <Center mih="100vh" style={{ background: "var(--sw-paper)" }}>
    <Text ff="var(--sw-font-hand)" fw={600} fz={44} c="var(--sw-ink-2)">
      SnugWeek
    </Text>
  </Center>
);

const shareIdFromPath = (): string | null => {
  const match = /^\/s\/([^/]+)/.exec(window.location.pathname);
  return match?.[1] ?? null;
};

export const PublicApp = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [share, setShare] = useState<ShareDoc | null>(null);
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    const shareId = shareIdFromPath();
    let cancelled = false;
    const settle = async (next: Status, doc: ShareDoc | null, lang: string) => {
      setTimeLocale(lang);
      await initI18n(isSupportedLang(lang) ? lang : DEFAULT_LANGUAGE).catch(
        () => {},
      );
      if (cancelled) return;
      setShare(doc);
      setStatus(next);
      setI18nReady(true);
    };
    if (!shareId) {
      void settle("missing", null, DEFAULT_LANGUAGE);
      return () => {
        cancelled = true;
      };
    }
    void getShare(shareId)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          void settle("missing", null, DEFAULT_LANGUAGE);
          return;
        }
        void settle("ready", doc, doc.language);
      })
      .catch(() => {
        if (cancelled) return;
        void settle("error", null, DEFAULT_LANGUAGE);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const theme = themeById(share?.themeId ?? DEFAULT_THEME_ID);
  const mantineTheme = useMemo(() => buildMantineTheme(theme), [theme]);

  useEffect(() => {
    document.documentElement.dataset.snugTheme = theme.id;
  }, [theme.id]);

  useEffect(() => {
    const lang = share?.language;
    document.documentElement.lang = isSupportedLang(lang) ? lang : DEFAULT_LANGUAGE;
  }, [share?.language]);

  const content =
    status === "loading" || !i18nReady ? (
      <PublicSplash />
    ) : status === "ready" && share ? (
      <PublicShareView share={share} />
    ) : (
      <PublicMissing variant={status === "error" ? "error" : "missing"} />
    );

  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={theme.kind}>
      {content}
    </MantineProvider>
  );
};
