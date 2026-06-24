import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface MonthComparisonProps {
  current: number;
  previous: number;
}

export const MonthComparison = ({ current, previous }: MonthComparisonProps) => {
  const { t } = useTranslation("stats");
  const delta = current - previous;
  const pct = previous === 0 ? null : Math.round((delta / previous) * 100);
  const color =
    delta === 0
      ? "var(--sw-ink-2)"
      : delta > 0
        ? "var(--sw-done)"
        : "var(--sw-danger)";
  const deltaLabel =
    pct === null
      ? `${delta >= 0 ? "+" : ""}${delta}`
      : `${pct >= 0 ? "+" : ""}${pct}%`;
  return (
    <Group justify="space-around" align="center" wrap="nowrap">
      <Stack gap={0} align="center">
        <Text ff="var(--sw-font-hand)" fz={36} fw={700} c="var(--sw-accent)">
          {current}
        </Text>
        <Text fz="xs" c="var(--sw-ink-3)">
          {t("thisMonth")}
        </Text>
      </Stack>
      <Stack gap={0} align="center">
        <Text fz="lg" fw={700} c={color}>
          {deltaLabel}
        </Text>
        <Text fz="xs" c="var(--sw-ink-3)">
          {t("vsPrevMonth")}
        </Text>
      </Stack>
      <Stack gap={0} align="center">
        <Text ff="var(--sw-font-hand)" fz={30} fw={700} c="var(--sw-ink-3)">
          {previous}
        </Text>
        <Text fz="xs" c="var(--sw-ink-3)">
          {t("prevMonth")}
        </Text>
      </Stack>
    </Group>
  );
};
