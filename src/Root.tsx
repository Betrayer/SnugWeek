import { Box, Center, MantineProvider, Stack, Text } from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import i18next from "i18next";
import { LazyMotion, domAnimation, m } from "motion/react";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { createBrowserRouter, redirect } from "react-router";
import { RouterProvider } from "react-router/dom";
import { coverBackground } from "./data/covers.ts";
import { DEFAULT_THEME_ID, themeById } from "./data/themes/registry.ts";
import { initI18n } from "./i18n/index.ts";
import { triggerCarryOver } from "./services/carryOver.ts";
import { triggerRoutineMaterialization } from "./services/routines/materializeRoutines.ts";
import {
  startReminderScheduler,
  stopReminderScheduler,
} from "./services/reminders/reminderScheduler.ts";
import { hasPendingMigration } from "./services/migration.ts";
import { setReadErrorHandler } from "./services/repos/readError.ts";
import { setWriteErrorHandler } from "./services/repos/writeError.ts";
import {
  currentMonthId,
  currentWeekId,
  isValidMonthId,
  isValidWeekId,
  setTimeLocale,
} from "./services/time.ts";
import { useAttachmentsStore } from "./state/attachmentsStore.ts";
import { useAuthStore } from "./state/authStore.ts";
import { useHabitsStore } from "./state/habitsStore.ts";
import { useListsStore } from "./state/listsStore.ts";
import { useMonthStore } from "./state/monthStore.ts";
import { useRecapStore } from "./state/recapStore.ts";
import { useRoutinesStore } from "./state/routinesStore.ts";
import { useStatsStore } from "./state/statsStore.ts";
import { useSubtasksStore } from "./state/subtasksStore.ts";
import { useTagsStore } from "./state/tagsStore.ts";
import { useTrackersStore } from "./state/trackersStore.ts";
import { useWeekStore } from "./state/weekStore.ts";
import { unlockSound } from "./services/sound/soundService.ts";
import { AuthErrorScreen } from "./shell/components/account/AuthErrorScreen.tsx";
import { ErrorBoundary } from "./shell/components/common/ErrorBoundary.tsx";
import { LockGate } from "./shell/components/lock/LockGate.tsx";
import { SkeletonBlock } from "./shell/components/common/SkeletonBlock.tsx";
import { useReducedMotionPref } from "./shell/hooks/useReducedMotionPref.ts";
import { UpdatePrompt } from "./shell/components/pwa/UpdatePrompt.tsx";
import { AppShell } from "./shell/layout/AppShell.tsx";
import { WeekPage } from "./shell/pages/WeekPage.tsx";
import { buildMantineTheme } from "./shell/theme.ts";
import { useProfileStore } from "./state/profileStore.ts";
import { useSettingsStore } from "./state/settingsStore.ts";

const MonthPage = lazy(() =>
  import("./shell/pages/MonthPage.tsx").then((module) => ({
    default: module.MonthPage,
  })),
);

const StatsPage = lazy(() =>
  import("./shell/pages/StatsPage.tsx").then((module) => ({
    default: module.StatsPage,
  })),
);

const SettingsPage = lazy(() =>
  import("./shell/pages/SettingsPage.tsx").then((module) => ({
    default: module.SettingsPage,
  })),
);

const PageFallback = () => (
  <Stack gap="md" maw={760}>
    <SkeletonBlock height={28} width="40%" />
    <SkeletonBlock height={16} count={6} />
  </Stack>
);

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "/",
        loader: ({ request }) =>
          redirect(`/w/${currentWeekId()}${new URL(request.url).search}`),
      },
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
        element: (
          <Suspense fallback={<PageFallback />}>
            <MonthPage />
          </Suspense>
        ),
      },
      {
        path: "/stats",
        element: (
          <Suspense fallback={<PageFallback />}>
            <StatsPage />
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<PageFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: "*",
        loader: ({ request }) =>
          redirect(`/w/${currentWeekId()}${new URL(request.url).search}`),
      },
    ],
  },
]);

const readBootNotebookName = (): string => {
  try {
    return localStorage.getItem("snugweek-notebook-name") ?? "";
  } catch {
    return "";
  }
};

const readBootCover = (): string | null => {
  try {
    return localStorage.getItem("snugweek-cover");
  } catch {
    return null;
  }
};

const Splash = () => {
  const reduced = useReducedMotionPref();
  const name = readBootNotebookName();
  const cover = coverBackground(readBootCover());
  const label = (
    <Text ff="var(--sw-font-hand)" fw={600} fz={44} c="var(--sw-ink-2)">
      {name || "SnugWeek"}
    </Text>
  );
  return (
    <Center
      mih="100vh"
      style={{ background: cover ?? "var(--sw-paper)" }}
    >
      <m.div
        initial={reduced ? false : { opacity: 0.72, scale: 0.985 }}
        animate={
          reduced
            ? { opacity: 1, scale: 1 }
            : { opacity: [0.72, 1, 0.72], scale: [0.985, 1, 0.985] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 1.6, ease: "easeInOut", repeat: Infinity }
        }
      >
        {cover ? (
          <Box
            px={28}
            py={14}
            style={{
              backgroundColor: "var(--sw-card)",
              border: "1px solid var(--sw-line)",
              borderRadius: "var(--mantine-radius-lg)",
              boxShadow: "var(--sw-shadow)",
            }}
          >
            {label}
          </Box>
        ) : (
          label
        )}
      </m.div>
    </Center>
  );
};

let lastSyncNotice = 0;

const errorCode = (error: unknown): string =>
  typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : "";

const notifySyncError = (
  error: unknown,
  messageKey: string,
  requireReady: boolean,
): void => {
  console.error(error);
  if (!navigator.onLine) return;
  if (requireReady && useAuthStore.getState().status !== "ready") return;
  const code = errorCode(error);
  if (code === "unavailable" || code === "cancelled") return;
  const now = Date.now();
  if (now - lastSyncNotice < 4000) return;
  lastSyncNotice = now;
  notifications.show({
    message: i18next.t(messageKey),
    withBorder: true,
    styles: { root: { borderColor: "var(--sw-danger)" } },
  });
};

const readBootThemeId = (systemDark: boolean): string => {
  try {
    const stored = localStorage.getItem("snugweek-theme");
    if (!stored) return DEFAULT_THEME_ID;
    if (stored.startsWith("auto:")) {
      const parts = stored.split(":");
      return (systemDark ? parts[2] : parts[1]) ?? DEFAULT_THEME_ID;
    }
    return stored;
  } catch {
    return DEFAULT_THEME_ID;
  }
};

const syncThemeColor = (color: string): void => {
  const existing = document.head.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  const meta = existing ?? document.createElement("meta");
  meta.name = "theme-color";
  meta.content = color;
  if (!existing) document.head.appendChild(meta);
};

export const Root = () => {
  const [i18nReady, setI18nReady] = useState(false);
  const authStatus = useAuthStore((state) => state.status);
  const uid = useAuthStore((state) => state.uid);
  const isAnonymous = useAuthStore((state) => state.isAnonymous);
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const retry = useAuthStore((state) => state.retry);
  const checkedMigrationUid = useRef<string | null>(null);
  const profileLoaded = useProfileStore((state) => state.loaded);
  const themeId = useProfileStore((state) => state.themeId);
  const autoTheme = useProfileStore((state) => state.autoTheme);
  const paperTextureEnabled = useProfileStore(
    (state) => state.paperTextureEnabled,
  );
  const notebookName = useProfileStore((state) => state.notebookName);
  const coverStyle = useProfileStore((state) => state.coverStyle);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches === true,
  );
  const effectiveThemeId = profileLoaded
    ? autoTheme
      ? systemDark
        ? autoTheme.dark
        : autoTheme.light
      : themeId
    : readBootThemeId(systemDark);
  const theme = themeById(effectiveThemeId);
  const mantineTheme = useMemo(() => buildMantineTheme(theme), [theme]);

  useEffect(() => {
    setWriteErrorHandler((error) =>
      notifySyncError(error, "common:saveError", false),
    );
    setReadErrorHandler((error) =>
      notifySyncError(error, "common:loadError", true),
    );
    bootstrap();
    const { language } = useSettingsStore.getState();
    setTimeLocale(language);
    void initI18n(language).then(() => setI18nReady(true));
  }, [bootstrap]);

  useEffect(() => {
    if (authStatus !== "ready" || !uid) {
      useProfileStore.getState().stop();
      useListsStore.getState().stop();
      useTrackersStore.getState().stop();
      useHabitsStore.getState().stop();
      useTagsStore.getState().stop();
      useRoutinesStore.getState().stop();
      useSubtasksStore.getState().stop();
      useAttachmentsStore.getState().stop();
      useWeekStore.getState().stop();
      useMonthStore.getState().stop();
      useStatsStore.getState().stop();
      useRecapStore.getState().stop();
      stopReminderScheduler();
      return;
    }
    useProfileStore.getState().start(uid);
    useListsStore.getState().start(uid);
    useTrackersStore.getState().start(uid);
    useHabitsStore.getState().start(uid);
    useTagsStore.getState().start(uid);
    useRoutinesStore.getState().start(uid);
    triggerCarryOver(uid);
    triggerRoutineMaterialization(uid);
    startReminderScheduler(uid);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        triggerCarryOver(uid);
        triggerRoutineMaterialization(uid);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [authStatus, uid]);

  useEffect(() => {
    if (authStatus !== "ready" || !uid || isAnonymous) return;
    if (checkedMigrationUid.current === uid) return;
    checkedMigrationUid.current = uid;
    void hasPendingMigration(uid)
      .then((pending) => {
        if (pending) {
          notifications.show({ message: i18next.t("auth:pendingMigration") });
        }
      })
      .catch(() => { });
  }, [authStatus, uid, isAnonymous]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!profileLoaded) return;
    const root = document.documentElement;
    root.dataset.snugTheme = theme.id;
    const cache = autoTheme
      ? `auto:${autoTheme.light}:${autoTheme.dark}`
      : theme.id;
    try {
      localStorage.setItem("snugweek-theme", cache);
    } catch (error) {
      console.error(error);
    }
    const paper = theme.vars["--sw-paper"];
    const ink = theme.vars["--sw-ink-2"];
    if (paper) {
      root.style.setProperty("--boot-paper", paper);
      syncThemeColor(paper);
    }
    if (ink) root.style.setProperty("--boot-ink", ink);
  }, [theme, autoTheme, profileLoaded]);

  useEffect(() => {
    if (!profileLoaded) return;
    const value = paperTextureEnabled ? "on" : "off";
    document.documentElement.dataset.paperTexture = value;
    try {
      localStorage.setItem("snugweek-paper-texture", value);
    } catch (error) {
      console.error(error);
    }
  }, [paperTextureEnabled, profileLoaded]);

  useEffect(() => {
    if (!profileLoaded) return;
    try {
      localStorage.setItem("snugweek-notebook-name", notebookName ?? "");
      localStorage.setItem("snugweek-cover", coverStyle ?? "");
    } catch (error) {
      console.error(error);
    }
  }, [notebookName, coverStyle, profileLoaded]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    const unlock = () => {
      unlockSound();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const ready = i18nReady && authStatus === "ready";

  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={theme.kind}>
      <Notifications />
      <UpdatePrompt />
      <ErrorBoundary>
        <LazyMotion features={domAnimation}>
          {authStatus === "error" ? (
            <AuthErrorScreen onRetry={retry} />
          ) : ready ? (
            <LockGate>
              <RouterProvider router={router} />
            </LockGate>
          ) : (
            <Splash />
          )}
        </LazyMotion>
      </ErrorBoundary>
    </MantineProvider>
  );
};
