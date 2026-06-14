import { BarChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";

interface CompletedPerDayChartProps {
  data: { day: number; done: number }[];
}

export const CompletedPerDayChart = ({ data }: CompletedPerDayChartProps) => {
  const { t } = useTranslation("stats");
  return (
    <BarChart
      h={180}
      data={data}
      dataKey="day"
      series={[{ name: "done", label: t("completed"), color: "var(--sw-accent)" }]}
      gridAxis="y"
      textColor="var(--sw-ink-3)"
      gridColor="var(--sw-line)"
      yAxisProps={{ allowDecimals: false, width: 26 }}
      xAxisProps={{ interval: 4, minTickGap: 4 }}
      barProps={{ radius: [4, 4, 0, 0] }}
      aria-label={t("perDayAria")}
    />
  );
};
