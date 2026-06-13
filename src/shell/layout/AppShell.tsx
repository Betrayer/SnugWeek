import { AppShell as MantineAppShell } from "@mantine/core";
import { Outlet } from "react-router";
import { useIsMobile } from "../hooks/useIsMobile.ts";
import { HeaderBar } from "./HeaderBar.tsx";
import { MobileTabBar } from "./MobileTabBar.tsx";
import { SidebarPanel } from "./SidebarPanel.tsx";

export const AppShell = () => {
  const isMobile = useIsMobile();
  return (
    <MantineAppShell
      header={{ height: 56 }}
      aside={isMobile ? undefined : { width: 300, breakpoint: "md" }}
      footer={isMobile ? { height: 64 } : undefined}
      padding="md"
      styles={{
        header: {
          backgroundColor: "var(--sw-paper)",
          borderBottom: "1px solid var(--sw-line)",
        },
        aside: { backgroundColor: "transparent", borderInlineStart: 0 },
        footer: {
          backgroundColor: "var(--sw-card)",
          borderTop: "1px solid var(--sw-line)",
        },
      }}
    >
      <MantineAppShell.Header>
        <HeaderBar />
      </MantineAppShell.Header>
      {!isMobile && (
        <MantineAppShell.Aside>
          <SidebarPanel />
        </MantineAppShell.Aside>
      )}
      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
      {isMobile && (
        <MantineAppShell.Footer>
          <MobileTabBar />
        </MantineAppShell.Footer>
      )}
    </MantineAppShell>
  );
};
