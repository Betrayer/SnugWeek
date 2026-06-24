import { Drawer } from "@mantine/core";
import type { ReactNode } from "react";

interface BottomSheetProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: string | number;
}

export const BottomSheet = ({
  opened,
  onClose,
  title,
  children,
  size = "auto",
}: BottomSheetProps) => (
  <Drawer
    opened={opened}
    onClose={onClose}
    position="bottom"
    size={size}
    zIndex={300}
    title={title}
    radius="lg"
    overlayProps={{ backgroundOpacity: 0.45 }}
    styles={{
      content: {
        backgroundColor: "var(--sw-paper)",
        borderTopLeftRadius: "var(--mantine-radius-lg)",
        borderTopRightRadius: "var(--mantine-radius-lg)",
        display: "flex",
        flexDirection: "column",
      },
      header: {
        backgroundColor: "var(--sw-paper)",
        paddingBottom: 4,
      },
      title: {
        fontFamily: "var(--sw-font-hand)",
        fontSize: 24,
        color: "var(--sw-ink-2)",
      },
      body: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingBottom: "calc(var(--mantine-spacing-lg) + env(safe-area-inset-bottom))",
      },
    }}
  >
    {children}
  </Drawer>
);
