import { AppShell as MantineAppShell } from "@mantine/core";
import { Outlet } from "react-router";
import { MoveTaskMenu } from "../components/tasks/MoveTaskMenu.tsx";
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
    </MantineAppShell>
  );
};
