import { Heatmap } from "@mantine/charts";
import { Box, Group, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  monthShortLabels,
  weekdayShortLabels,
} from "../../../services/time.ts";

interface YearHeatmapProps {
  year: number;
  perDay: Record<string, number>;
  max: number;
  locale: string;
}

const HEAT_COLORS = [
  "color-mix(in srgb, var(--sw-accent) 30%, transparent)",
  "color-mix(in srgb, var(--sw-accent) 55%, transparent)",
  "color-mix(in srgb, var(--sw-accent) 80%, transparent)",
  "var(--sw-accent)",
];

export const YearHeatmap = ({ year, perDay, max, locale }: YearHeatmapProps) => {
  const { t } = useTranslation("stats");
  const data: Record<string, number> = {};
  for (const [key, count] of Object.entries(perDay)) {
    if (count > 0) data[key] = count;
  }
  return (
    <Box>
      <Box style={{ overflowX: "auto" }} className="sw-hide-scrollbar">
        <Heatmap
          data={data}
          startDate={`${year}-01-01`}
          endDate={`${year}-12-31`}
          withMonthLabels
          monthLabels={monthShortLabels(locale)}
          withWeekdayLabels
          weekdayLabels={weekdayShortLabels(locale)}
          firstDayOfWeek={1}
          rectSize={12}
          gap={3}
          rectRadius={3}
          weekdaysLabelsWidth={26}
          fontSize={11}
          colors={HEAT_COLORS}
          domain={max > 0 ? [1, max] : undefined}
          withTooltip
          getTooltipLabel={({ date, value }) => `${date}: ${value ?? 0}`}
          getRectProps={({ value }) =>
            value === null ? { fill: "var(--sw-line)" } : {}
          }
          styles={{
            monthLabel: { fill: "var(--sw-ink-3)" },
            weekdayLabel: { fill: "var(--sw-ink-3)" },
          }}
        />
      </Box>
      <Group gap={6} justify="flex-end" mt="xs">
        <Text fz="xs" c="var(--sw-ink-3)">
          {t("heatmapLess")}
        </Text>
        {HEAT_COLORS.map((color) => (
          <div
            key={color}
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              backgroundColor: color,
            }}
          />
        ))}
        <Text fz="xs" c="var(--sw-ink-3)">
          {t("heatmapMore")}
        </Text>
      </Group>
    </Box>
  );
};
