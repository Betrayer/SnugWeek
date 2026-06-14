import { MantineProvider, Stack, Text } from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import i18next from "i18next";
import { useEffect, useMemo, useState } from "react";
import { createBrowserRouter, redirect } from "react-router";
import { RouterProvider } from "react-router/dom";
import { themeById } from "./data/themes/registry.ts";
import { initI18n } from "./i18n/index.ts";
import { triggerCarryOver } from "./services/carryOver.ts";
import { setWriteErrorHandler } from "./services/repos/writeError.ts";
import {
  currentMonthId,
  currentWeekId,
  isValidMonthId,
  isValidWeekId,
  setTimeLocale,
} from "./services/time.ts";
import { useAuthStore } from "./state/authStore.ts";
import { useListsStore } from "./state/listsStore.ts";
import { AppShell } from "./shell/layout/AppShell.tsx";
import { MonthPage } from "./shell/pages/MonthPage.tsx";
import { SettingsPage } from "./shell/pages/SettingsPage.tsx";
import { StatsPage } from "./shell/pages/StatsPage.tsx";
import { WeekPage } from "./shell/pages/WeekPage.tsx";
import { buildMantineTheme } from "./shell/theme.ts";
import { useProfileStore } from "./state/profileStore.ts";
import { useSettingsStore } from "./state/settingsStore.ts";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", loader: () => redirect(`/w/${currentWeekId()}`) },
      {
        path: "/w/:weekId",
        loader: ({ params }) =>
          isValidWeekId(params.weekId ?? "")
            ? null
            : redirect(`/w/${currentWeekId()}`),
        element: <WeekPage />,
      },
      {
        path: "/month/:monthId",
        loader: ({ params }) =>
          isValidMonthId(params.monthId ?? "")
            ? null
            : redirect(`/month/${currentMonthId()}`),
        element: <MonthPage />,
      },
      { path: "/stats", element: <StatsPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "*", loader: () => redirect(`/w/${currentWeekId()}`) },
    ],
  },
]);

const Splash = () => (
  <Stack align="center" justify="center" mih="100vh">
    <Text ff="var(--sw-font-hand)" fz={44} c="var(--sw-ink-2)">
      SnugWeek
    </Text>
  </Stack>
);

export const Root = () => {
  const [i18nReady, setI18nReady] = useState(false);
  const authStatus = useAuthStore((state) => state.status);
  const uid = useAuthStore((state) => state.uid);
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const themeId = useProfileStore((state) => state.themeId);
  const theme = themeById(themeId);
  const mantineTheme = useMemo(() => buildMantineTheme(theme), [theme]);

  useEffect(() => {
    setWriteErrorHandler((error) => {
      console.error(error);
      if (!navigator.onLine) return;
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code: unknown }).code)
          : "";
      if (code === "unavailable") return;
      notifications.show({
        message: i18next.t("common:saveError"),
        withBorder: true,
        styles: { root: { borderColor: "var(--sw-danger)" } },
      });
    });
    bootstrap();
    const { language } = useSettingsStore.getState();
    setTimeLocale(language);
    void initI18n(language).then(() => setI18nReady(true));
  }, [bootstrap]);

  useEffect(() => {
    if (authStatus !== "ready" || !uid) return;
    useProfileStore.getState().start(uid);
    useListsStore.getState().start(uid);
    triggerCarryOver(uid);
    const onVisible = () => {
      if (document.visibilityState === "visible") triggerCarryOver(uid);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [authStatus, uid]);

  useEffect(() => {
    document.documentElement.dataset.snugTheme = theme.id;
  }, [theme.id]);

  const ready = i18nReady && authStatus === "ready";

  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={theme.kind}>
      <Notifications />
      {ready ? <RouterProvider router={router} /> : <Splash />}
    </MantineProvider>
  );
};
