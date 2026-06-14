import { Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  label: string;
  minHeight?: number;
}

export const EmptyState = ({ icon, label, minHeight = 72 }: EmptyStateProps) => (
  <Stack
    align="center"
    justify="center"
    gap={4}
    style={{ minHeight, textAlign: "center" }}
  >
    <span aria-hidden style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
      {icon}
    </span>
    <Text ff="var(--sw-font-hand)" fz="lg" c="var(--sw-ink-3)">
      {label}
    </Text>
  </Stack>
);
