import type { CSSProperties } from "react";

export const cardSurface = (radius: "md" | "lg" = "md"): CSSProperties => ({
  backgroundColor: "var(--sw-card)",
  border: "1px solid var(--sw-line)",
  borderRadius: `var(--mantine-radius-${radius})`,
});
