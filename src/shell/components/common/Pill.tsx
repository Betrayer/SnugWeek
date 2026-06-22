import type { CSSProperties, ReactNode } from "react";

type PillTone = "accent-2" | "muted";

const toneStyle: Record<PillTone, CSSProperties> = {
  "accent-2": {
    color: "var(--sw-accent-2)",
    backgroundColor: "color-mix(in srgb, var(--sw-accent-2) 14%, transparent)",
  },
  muted: {
    color: "var(--sw-ink-3)",
    backgroundColor: "color-mix(in srgb, var(--sw-ink-3) 10%, transparent)",
  },
};

interface PillProps {
  tone: PillTone;
  icon?: ReactNode;
  children: ReactNode;
}

export const Pill = ({ tone, icon, children }: PillProps) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      alignSelf: "flex-start",
      fontSize: 10,
      fontWeight: 700,
      lineHeight: 1.5,
      padding: "0 6px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      ...toneStyle[tone],
    }}
  >
    {icon}
    {children}
  </span>
);
