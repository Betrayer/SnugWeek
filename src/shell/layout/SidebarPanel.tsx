import { Box } from "@mantine/core";
import { ListsPanel } from "../components/sidebar/ListsPanel.tsx";

export const SidebarPanel = () => (
  <Box
    style={{
      flex: 1,
      minHeight: 0,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      backgroundColor: "var(--sw-paper-2)",
      borderInlineStart: "1px dashed var(--sw-line)",
      borderRadius: "var(--mantine-radius-lg)",
    }}
  >
    <Box
      aria-hidden
      style={{
        position: "absolute",
        insetBlock: 0,
        insetInlineStart: 5,
        width: 12,
        backgroundImage:
          "radial-gradient(circle at 6px 14px, var(--sw-paper) 4px, transparent 5px)",
        backgroundSize: "12px 28px",
        backgroundRepeat: "repeat-y",
      }}
    />
    <Box
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "var(--mantine-spacing-lg)",
        paddingInlineStart: "calc(var(--mantine-spacing-lg) + 16px)",
      }}
    >
      <ListsPanel />
    </Box>
  </Box>
);
