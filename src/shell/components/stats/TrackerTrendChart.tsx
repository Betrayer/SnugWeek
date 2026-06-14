import { LineChart } from "@mantine/charts";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { MonthTrendPoint } from "../../../services/stats/monthStatsData.ts";

interface TrackerTrendChartProps {
  data: MonthTrendPoint[];
  showMood: boolean;
  showEnergy: boolean;
}

interface TrendSeries {
  name: string;
  label: string;
  color: string;
}

export const TrackerTrendChart = ({
  data,
  showMood,
  showEnergy,
}: TrackerTrendChartProps) => {
  const { t } = useTranslation(["stats", "trackers"]);
  const pointCount = data.filter(
    (point) => point.mood !== null || point.energy !== null,
  ).length;
  const series: TrendSeries[] = [];
  if (showMood) {
    series.push({
      name: "mood",
      label: t("trackers:defaults.mood"),
      color: "var(--sw-accent)",
    });
  }
  if (showEnergy) {
    series.push({
      name: "energy",
      label: t("trackers:defaults.energy"),
      color: "var(--sw-accent-2)",
    });
  }
  return (
    <LineChart
      h={180}
      data={data}
      dataKey="day"
      series={series}
      connectNulls={false}
      curveType="monotone"
      strokeWidth={pointCount < 3 ? 0 : 2}
      withDots
      dotProps={{ r: 3 }}
      gridAxis="y"
      style={{ "--chart-text-color": "var(--sw-ink-3)" } as CSSProperties}
      gridColor="var(--sw-line)"
      yAxisProps={{ domain: [0, 5], ticks: [1, 2, 3, 4, 5], width: 22 }}
      xAxisProps={{ interval: 4, minTickGap: 4 }}
      aria-label={t("stats:trendAria")}
    />
  );
};
