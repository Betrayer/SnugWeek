import { Center, Loader, SimpleGrid, Stack } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { trackerColorValue } from "../../../data/trackerColors.ts";
import type { WeekDoc } from "../../../services/repos/weeksRepo.ts";
import { yearHabitConsistency } from "../../../services/stats/habitConsistency.ts";
import type { TrendTracker } from "../../../services/stats/monthStatsData.ts";
import { routineAdherence } from "../../../services/stats/routineAdherence.ts";
import { longestStreaks } from "../../../services/stats/streaks.ts";
import {
  tagBreakdown,
  timeOfDayDistribution,
  weekdayCompletion,
} from "../../../services/stats/taskAnalytics.ts";
import { yearTrackerAveragesTrend } from "../../../services/stats/trackerStats.ts";
import { buildYearStats } from "../../../services/stats/yearStatsData.ts";
import {
  buildYearHeatmap,
  monthShortLabels,
  todayDateKey,
} from "../../../services/time.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useRoutinesStore } from "../../../state/routinesStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useStatsStore } from "../../../state/statsStore.ts";
import { useTagsStore } from "../../../state/tagsStore.ts";
import { useTrackersStore } from "../../../state/trackersStore.ts";
import { EmptyState } from "../common/EmptyState.tsx";
import {
  FlameDoodle,
  LeafDoodle,
  MoonDoodle,
  SparkleDoodle,
  StarDoodle,
} from "../common/doodles.tsx";
import { trackerDisplayName } from "../trackers/trackerName.ts";
import { HabitConsistencyList } from "./HabitConsistencyList.tsx";
import { HabitStreaks } from "./HabitStreaks.tsx";
import { KpiTile } from "./KpiTile.tsx";
import { MonthsBarChart } from "./MonthsBarChart.tsx";
import { RoutineAdherenceList } from "./RoutineAdherenceList.tsx";
import { StatCard } from "./StatCard.tsx";
import { TimeOfDayChart } from "./TimeOfDayChart.tsx";
import { TagBreakdownList } from "./TagBreakdownList.tsx";
import { TrackerAveragesTrend } from "./TrackerAveragesTrend.tsx";
import { WeekdayChart } from "./WeekdayChart.tsx";
import { YearHeatmap } from "./YearHeatmap.tsx";

export const YearStatsView = () => {
  const { t } = useTranslation(["stats", "trackers"]);
  const yearValue = useStatsStore((state) => state.yearValue);
  const yearMonths = useStatsStore((state) => state.yearMonths);
  const yearWeeks = useStatsStore((state) => state.yearWeeks);
  const yearDoneTasks = useStatsStore((state) => state.yearDoneTasks);
  const yearDayTasks = useStatsStore((state) => state.yearDayTasks);
  const yearStatus = useStatsStore((state) => state.yearStatus);
  const language = useSettingsStore((state) => state.language);
  const habits = useHabitsStore((state) => state.habits);
  const currentStreaks = useHabitsStore((state) => state.streaks);
  const moduleToggles = useProfileStore((state) => state.moduleToggles);
  const trackers = useTrackersStore((state) => state.trackers);
  const routines = useRoutinesStore((state) => state.routines);
  const tags = useTagsStore((state) => state.tags);

  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.archived),
    [habits],
  );
  const labels = useMemo(() => monthShortLabels(language), [language]);

  const trendTrackers = useMemo<TrendTracker[]>(
    () =>
      moduleToggles.dayTrackers
        ? trackers
            .filter((tracker) => tracker.enabled)
            .map((tracker) => ({
              id: tracker.id,
              type: tracker.type,
              name: trackerDisplayName(tracker, t),
              color: trackerColorValue(tracker.color),
            }))
        : [],
    [trackers, moduleToggles.dayTrackers, t],
  );

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

  const habitStats = useMemo(() => {
    if (yearValue === null) {
      return { longest: {}, consistency: {} };
    }
    const heatmap = buildYearHeatmap(yearValue, language);
    const byId: Record<string, WeekDoc> = {};
    for (const entry of yearWeeks) byId[entry.id] = entry.week;
    const schedules = activeHabits.map((habit) => ({
      id: habit.id,
      days: habit.days,
    }));
    return {
      longest: longestStreaks(heatmap, byId, schedules),
      consistency: yearHabitConsistency(heatmap, byId, schedules, todayDateKey()),
    };
  }, [yearValue, yearWeeks, activeHabits, language]);

  const weekday = useMemo(
    () => (view ? weekdayCompletion(view.perDay) : []),
    [view],
  );
  const timeOfDay = useMemo(
    () => timeOfDayDistribution(yearDoneTasks),
    [yearDoneTasks],
  );
  const tagData = useMemo(
    () => tagBreakdown(yearDoneTasks, tags),
    [yearDoneTasks, tags],
  );
  const adherence = useMemo(
    () =>
      yearValue !== null
        ? routineAdherence(yearDayTasks, routines, (key) =>
            key.startsWith(`${yearValue}-`),
          )
        : [],
    [yearDayTasks, routines, yearValue],
  );
  const trackerTrend = useMemo(
    () =>
      yearValue !== null
        ? yearTrackerAveragesTrend(yearWeeks, trendTrackers, yearValue, labels)
        : { points: [], series: [] },
    [yearWeeks, trendTrackers, yearValue, labels],
  );

  if (!view || yearStatus === "loading") {
    return (
      <Center mih="40vh">
        <Loader color="var(--sw-accent)" />
      </Center>
    );
  }

  const showStreaks = moduleToggles.habits && activeHabits.length > 0;
  const isEmpty =
    !view.hasData &&
    activeHabits.every(
      (habit) =>
        (habitStats.longest[habit.id] ?? 0) === 0 &&
        (currentStreaks[habit.id] ?? 0) === 0,
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

  const consistency = activeHabits.map((habit) => ({
    habitId: habit.id,
    name: habit.name,
    icon: habit.icon,
    pct: habitStats.consistency[habit.id]?.pct ?? 0,
  }));
  const bestMonth = Math.max(0, ...view.months.map((month) => month.done));
  const activeDays = Object.values(view.perDay).filter((n) => n > 0).length;
  const bestStreak = Math.max(0, ...Object.values(habitStats.longest));

  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 2, sm: showStreaks ? 4 : 3 }} spacing="sm">
        <KpiTile
          value={view.total}
          caption={t("kpi.total")}
          icon={<SparkleDoodle size={22} />}
        />
        <KpiTile
          value={bestMonth}
          caption={t("kpi.bestMonth")}
          icon={<StarDoodle size={22} />}
        />
        <KpiTile
          value={activeDays}
          caption={t("kpi.activeDays")}
          icon={<LeafDoodle size={22} />}
        />
        {showStreaks && (
          <KpiTile
            value={bestStreak}
            caption={t("kpi.streak")}
            icon={<FlameDoodle size={22} />}
          />
        )}
      </SimpleGrid>
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

      {(view.hasData || timeOfDay.total > 0) && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
          {view.hasData && (
            <StatCard title={t("weekdayTitle")}>
              <WeekdayChart data={weekday} />
            </StatCard>
          )}
          {timeOfDay.total > 0 && (
            <StatCard title={t("timeOfDayTitle")}>
              <TimeOfDayChart data={timeOfDay.data} />
            </StatCard>
          )}
        </SimpleGrid>
      )}

      {trackerTrend.series.length > 0 && (
        <StatCard title={t("trackerAvgTitle")}>
          <TrackerAveragesTrend
            points={trackerTrend.points}
            series={trackerTrend.series}
          />
        </StatCard>
      )}

      {tagData.length > 0 && (
        <StatCard title={t("tagsTitle")}>
          <TagBreakdownList data={tagData} />
        </StatCard>
      )}

      {adherence.length > 0 && (
        <StatCard title={t("routinesTitle")}>
          <RoutineAdherenceList data={adherence} />
        </StatCard>
      )}

      {showStreaks && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
          <StatCard title={t("consistencyTitle")}>
            <HabitConsistencyList data={consistency} />
          </StatCard>
          <StatCard title={t("streaksTitle")}>
            <HabitStreaks
              habits={activeHabits}
              longest={habitStats.longest}
              current={currentStreaks}
            />
          </StatCard>
        </SimpleGrid>
      )}
    </Stack>
  );
};
