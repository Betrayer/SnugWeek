import { Center, Loader, Stack } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { WeekDoc } from "../../../services/repos/weeksRepo.ts";
import { longestStreaks } from "../../../services/stats/streaks.ts";
import { buildYearStats } from "../../../services/stats/yearStatsData.ts";
import { buildYearHeatmap, monthShortLabels } from "../../../services/time.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useStatsStore } from "../../../state/statsStore.ts";
import { EmptyState } from "../common/EmptyState.tsx";
import { MoonDoodle } from "../common/doodles.tsx";
import { HabitStreaks } from "./HabitStreaks.tsx";
import { MonthsBarChart } from "./MonthsBarChart.tsx";
import { StatCard } from "./StatCard.tsx";
import { YearHeatmap } from "./YearHeatmap.tsx";

export const YearStatsView = () => {
  const { t } = useTranslation("stats");
  const yearValue = useStatsStore((state) => state.yearValue);
  const yearMonths = useStatsStore((state) => state.yearMonths);
  const yearWeeks = useStatsStore((state) => state.yearWeeks);
  const yearStatus = useStatsStore((state) => state.yearStatus);
  const language = useSettingsStore((state) => state.language);
  const habits = useHabitsStore((state) => state.habits);
  const currentStreaks = useHabitsStore((state) => state.streaks);
  const habitsModule = useProfileStore((state) => state.moduleToggles.habits);

  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.archived),
    [habits],
  );
  const labels = useMemo(() => monthShortLabels(language), [language]);

  const view = useMemo(
    () =>
      yearValue !== null
        ? buildYearStats({
            year: yearValue,
            monthStats: yearMonths,
            monthLabels: labels,
          })
        : null,
    [yearValue, yearMonths, labels],
  );

  const longest = useMemo(() => {
    if (yearValue === null) return {};
    const heatmap = buildYearHeatmap(yearValue, language);
    const byId: Record<string, WeekDoc> = {};
    for (const entry of yearWeeks) byId[entry.id] = entry.week;
    return longestStreaks(
      heatmap,
      byId,
      activeHabits.map((habit) => habit.id),
    );
  }, [yearValue, yearWeeks, activeHabits, language]);

  if (!view || yearStatus === "loading") {
    return (
      <Center mih="40vh">
        <Loader color="var(--sw-accent)" />
      </Center>
    );
  }

  const showStreaks = habitsModule && activeHabits.length > 0;
  const isEmpty =
    !view.hasData &&
    activeHabits.every(
      (habit) =>
        (longest[habit.id] ?? 0) === 0 && (currentStreaks[habit.id] ?? 0) === 0,
    );

  if (isEmpty) {
    return (
      <EmptyState
        icon={<MoonDoodle size={40} />}
        label={t("yearEmpty")}
        minHeight={0}
      />
    );
  }

  return (
    <Stack gap="md">
      <StatCard title={t("monthsTitle")}>
        <MonthsBarChart months={view.months} />
      </StatCard>
      <StatCard title={t("heatmapTitle")}>
        <YearHeatmap
          year={view.year}
          perDay={view.perDay}
          max={view.maxPerDay}
          locale={language}
        />
      </StatCard>
      {showStreaks && (
        <StatCard title={t("streaksTitle")}>
          <HabitStreaks
            habits={activeHabits}
            longest={longest}
            current={currentStreaks}
          />
        </StatCard>
      )}
    </Stack>
  );
};
