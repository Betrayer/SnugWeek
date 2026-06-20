import { Box } from "@mantine/core";
import { TOUR_ANCHORS } from "../../data/tourSteps.ts";
import { ListsPanel } from "../components/sidebar/ListsPanel.tsx";

export const SidebarPanel = () => (
  <Box
    data-tour={TOUR_ANCHORS.sidebar}
    style={{
      flex: 1,
      minHeight: 0,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      backgroundColor: "var(--sw-paper-2)",
      backgroundImage: "var(--sw-paper-texture)",
      borderInlineStart: "1px dashed var(--sw-line)",
      borderRadius: "var(--mantine-radius-lg)",
      boxShadow: "inset 9px 0 12px -10px var(--sw-fold-shade)",
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
          "radial-gradient(circle at 6px 14px, var(--sw-paper) 3.5px, color-mix(in srgb, var(--sw-fold-shade) 45%, transparent) 4.2px, transparent 5.2px)",
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
