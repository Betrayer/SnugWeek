import { Card, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  children: ReactNode;
}

export const StatCard = ({ title, children }: StatCardProps) => (
  <Card
    radius="lg"
    padding="md"
    h="100%"
    style={{
      border: "1px solid var(--sw-line)",
      backgroundColor: "var(--sw-card)",
      boxShadow: "var(--sw-shadow)",
    }}
  >
    <Stack gap="xs" h="100%">
      <Text fw={700} fz="sm" c="var(--sw-ink-2)">
        {title}
      </Text>
      {children}
    </Stack>
  </Card>
);
