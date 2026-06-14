import { Stack, Text } from "@mantine/core";

interface StatTileProps {
  value: number;
  caption: string;
}

export const StatTile = ({ value, caption }: StatTileProps) => (
  <Stack align="center" justify="center" gap={2} h="100%">
    <Text ff="var(--sw-font-hand)" fz={40} fw={700} c="var(--sw-accent)">
      {value}
    </Text>
    <Text fz="xs" c="var(--sw-ink-3)" ta="center">
      {caption}
    </Text>
  </Stack>
);
