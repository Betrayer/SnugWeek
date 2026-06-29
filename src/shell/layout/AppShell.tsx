import { AppShell as MantineAppShell } from "@mantine/core";
import { Outlet, useMatch } from "react-router";
import { coverBackground } from "../../data/covers.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { AccountDialogs } from "../components/account/AccountDialogs.tsx";
import { CheerOverlay } from "../components/cheer/CheerOverlay.tsx";
import { FocusTimerHost } from "../components/focus/FocusTimerHost.tsx";
import { CommandSurface } from "../components/search/CommandSurface.tsx";
import { MoveTaskMenu } from "../components/tasks/MoveTaskMenu.tsx";
import { TaskDetail } from "../components/tasks/TaskDetail.tsx";
import { HintHost } from "../components/tour/HintHost.tsx";
import { TourHost } from "../components/tour/TourHost.tsx";
import { TourPrompt } from "../components/tour/TourPrompt.tsx";
import { useIsMobile } from "../hooks/useIsMobile.ts";
import { HeaderBar } from "./HeaderBar.tsx";
import { MobileTabBar } from "./MobileTabBar.tsx";
import { SidebarDrawer } from "./SidebarDrawer.tsx";

export const AppShell = () => {
  const isMobile = useIsMobile();
  const onWeek = useMatch("/w/:weekId") !== null;
  const coverStyle = useProfileStore((state) => state.coverStyle);
  const cover = coverBackground(coverStyle);
  return (
    <MantineAppShell
      header={{ height: 56 }}
      footer={isMobile ? { height: 64 } : undefined}
      padding="md"
      styles={{
        header: {
          backgroundColor: "var(--sw-paper)",
          borderBottom: "1px solid var(--sw-line)",
        },
        footer: {
          backgroundColor: "var(--sw-card)",
          borderTop: "1px solid var(--sw-line)",
        },
      }}
    >
      <MantineAppShell.Header>
        <HeaderBar />
      </MantineAppShell.Header>
      <MantineAppShell.Main style={{ position: "relative" }}>
        {onWeek && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
              background: `var(--sw-paper-texture), ${cover ?? "var(--sw-paper)"}`,
            }}
          />
        )}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Outlet />
        </div>
      </MantineAppShell.Main>
      {isMobile && (
        <MantineAppShell.Footer>
          <MobileTabBar />
        </MantineAppShell.Footer>
      )}
      {isMobile && <SidebarDrawer />}
      <MoveTaskMenu />
      <TaskDetail />
      <CommandSurface />
      <AccountDialogs />
      <FocusTimerHost />
      <TourHost />
      <TourPrompt />
      <HintHost />
      <CheerOverlay />
    </MantineAppShell>
  );
};
