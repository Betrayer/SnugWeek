import { AppShell as MantineAppShell } from "@mantine/core";
import { Outlet } from "react-router";
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
      <MantineAppShell.Main>
        <Outlet />
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
