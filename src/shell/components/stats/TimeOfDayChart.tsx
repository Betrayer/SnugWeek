import { BarChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";
import type { TimeOfDayDatum } from "../../../services/stats/taskAnalytics.ts";

interface TimeOfDayChartProps {
  data: TimeOfDayDatum[];
}

export const TimeOfDayChart = ({ data }: TimeOfDayChartProps) => {
  const { t } = useTranslation("stats");
  const chartData = data.map((datum) => ({
    label: t(`timeOfDay.${datum.bucket}`),
    count: datum.count,
  }));
  return (
    <BarChart
      h={170}
      data={chartData}
      dataKey="label"
      series={[
        {
          name: "count",
          label: t("timeOfDayTitle"),
          color: "var(--sw-accent-2)",
        },
      ]}
      gridAxis="y"
      tickLine="none"
      strokeDasharray="3 7"
      textColor="var(--sw-ink-3)"
      gridColor="var(--sw-line)"
      yAxisProps={{ allowDecimals: false, width: 26 }}
      barProps={{ radius: [8, 8, 0, 0] }}
      aria-label={t("timeOfDayAria")}
    />
  );
};
