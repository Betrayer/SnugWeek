import { Box, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface KpiTileProps {
  value: ReactNode;
  caption: string;
  icon?: ReactNode;
}

export const KpiTile = ({ value, caption, icon }: KpiTileProps) => (
  <Box
    style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      minHeight: 86,
      padding: "12px 10px",
      textAlign: "center",
      border: "1px solid var(--sw-line)",
      borderRadius: "var(--mantine-radius-lg)",
      backgroundColor: "var(--sw-card)",
      overflow: "hidden",
    }}
  >
    {icon && (
      <Box
        aria-hidden
        style={{
          position: "absolute",
          top: 7,
          insetInlineEnd: 8,
          color: "var(--sw-accent)",
          opacity: 0.32,
          pointerEvents: "none",
        }}
      >
        {icon}
      </Box>
    )}
    {typeof value === "number" || typeof value === "string" ? (
      <Text
        ff="var(--sw-font-hand)"
        fz={34}
        fw={700}
        lh={1}
        c="var(--sw-accent)"
      >
        {value}
      </Text>
    ) : (
      value
    )}
    <Text fz="xs" c="var(--sw-ink-3)" lh={1.2}>
      {caption}
    </Text>
  </Box>
);
