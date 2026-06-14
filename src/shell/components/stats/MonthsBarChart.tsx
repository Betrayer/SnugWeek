import { BarChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";
import type { YearMonthBar } from "../../../services/stats/yearStatsData.ts";

interface MonthsBarChartProps {
  months: YearMonthBar[];
}

export const MonthsBarChart = ({ months }: MonthsBarChartProps) => {
  const { t } = useTranslation("stats");
  const data = months.map((month) => ({
    label: month.label,
    done: month.isCurrent ? null : month.done,
    current: month.isCurrent ? month.done : null,
  }));
  return (
    <BarChart
      h={200}
      data={data}
      dataKey="label"
      type="stacked"
      series={[
        {
          name: "done",
          label: t("completed"),
          color: "var(--sw-accent)",
          stackId: "month",
        },
        {
          name: "current",
          label: t("completed"),
          color: "var(--sw-accent-2)",
          stackId: "month",
        },
      ]}
      gridAxis="y"
      textColor="var(--sw-ink-3)"
      gridColor="var(--sw-line)"
      yAxisProps={{ allowDecimals: false, width: 28 }}
      barProps={{ radius: [4, 4, 0, 0] }}
      aria-label={t("monthsAria")}
    />
  );
};
