import { BarChart } from "@mantine/charts";
import { Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { WeekdayDatum } from "../../../services/stats/taskAnalytics.ts";
import { weekdayLabels } from "../../../services/time.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";

interface WeekdayChartProps {
  data: WeekdayDatum[];
}

export const WeekdayChart = ({ data }: WeekdayChartProps) => {
  const { t } = useTranslation("stats");
  const language = useSettingsStore((state) => state.language);
  const labels = weekdayLabels(language);
  const chartData = data.map((datum) => ({
    label: labels[datum.iso - 1] ?? String(datum.iso),
    done: datum.done,
  }));

  const total = data.reduce((sum, datum) => sum + datum.done, 0);
  let bestIso = 0;
  let best = -1;
  for (const datum of data) {
    if (datum.done > best) {
      best = datum.done;
      bestIso = datum.iso;
    }
  }

  return (
    <>
      <BarChart
        h={170}
        data={chartData}
        dataKey="label"
        series={[
          { name: "done", label: t("completed"), color: "var(--sw-accent)" },
        ]}
        gridAxis="y"
        tickLine="none"
        strokeDasharray="3 7"
        textColor="var(--sw-ink-3)"
        gridColor="var(--sw-line)"
        yAxisProps={{ allowDecimals: false, width: 26 }}
        barProps={{ radius: [8, 8, 0, 0] }}
        aria-label={t("weekdayAria")}
      />
      {total > 0 && bestIso > 0 && (
        <Text fz="xs" c="var(--sw-ink-3)">
          {t("weekdayBest", { day: labels[bestIso - 1] ?? String(bestIso) })}
        </Text>
      )}
    </>
  );
};
