import { LineChart } from "@mantine/charts";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { TrendSeries } from "../../../services/stats/monthStatsData.ts";
import type { TrackerAvgPoint } from "../../../services/stats/trackerStats.ts";

interface TrackerAveragesTrendProps {
  points: TrackerAvgPoint[];
  series: TrendSeries[];
}

export const TrackerAveragesTrend = ({
  points,
  series,
}: TrackerAveragesTrendProps) => {
  const { t } = useTranslation("stats");
  return (
    <LineChart
      h={200}
      data={points}
      dataKey="label"
      series={series.map((item) => ({
        name: item.id,
        label: item.name,
        color: item.color,
      }))}
      withLegend
      legendProps={{ verticalAlign: "bottom", height: 36 }}
      connectNulls
      curveType="monotone"
      withDots
      dotProps={{ r: 3 }}
      gridAxis="y"
      style={{ "--chart-text-color": "var(--sw-ink-3)" } as CSSProperties}
      gridColor="var(--sw-line)"
      yAxisProps={{ allowDecimals: false, width: 24 }}
      aria-label={t("trackerAvgAria")}
    />
  );
};
