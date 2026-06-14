import { Card, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  children: ReactNode;
}

export const StatCard = ({ title, children }: StatCardProps) => (
  <Card
    withBorder
    radius="lg"
    padding="md"
    h="100%"
    style={{ borderColor: "var(--sw-line)" }}
  >
    <Stack gap="sm" h="100%">
      <Text fw={700} fz="sm" c="var(--sw-ink-2)">
        {title}
      </Text>
      {children}
    </Stack>
  </Card>
);
