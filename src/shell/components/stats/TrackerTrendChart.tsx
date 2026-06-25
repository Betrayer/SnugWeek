import { LineChart } from "@mantine/charts";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type {
  MonthTrendPoint,
  TrendSeries,
} from "../../../services/stats/monthStatsData.ts";

interface TrackerTrendChartProps {
  data: MonthTrendPoint[];
  series: TrendSeries[];
}

export const TrackerTrendChart = ({ data, series }: TrackerTrendChartProps) => {
  const { t } = useTranslation("stats");
  let pointCount = 0;
  let maxValue = 5;
  for (const point of data) {
    let hasValue = false;
    for (const item of series) {
      const value = point[item.id];
      if (typeof value === "number") {
        hasValue = true;
        if (value > maxValue) maxValue = value;
      }
    }
    if (hasValue) pointCount += 1;
  }
  const domainMax = Math.ceil(maxValue);
  return (
    <LineChart
      h={180}
      data={data}
      dataKey="day"
      series={series.map((item) => ({
        name: item.id,
        label: item.name,
        color: item.color,
      }))}
      withLegend
      legendProps={{ verticalAlign: "bottom", height: 36 }}
      connectNulls={false}
      curveType="monotone"
      strokeWidth={pointCount < 3 ? 0 : 2.4}
      withDots
      dotProps={{ r: 3.2, strokeWidth: 0 }}
      gridAxis="y"
      tickLine="none"
      strokeDasharray="3 7"
      style={{ "--chart-text-color": "var(--sw-ink-3)" } as CSSProperties}
      gridColor="var(--sw-line)"
      yAxisProps={{ domain: [0, domainMax], allowDecimals: false, width: 24 }}
      xAxisProps={{ interval: 4, minTickGap: 4 }}
      aria-label={t("trendAria")}
    />
  );
};
