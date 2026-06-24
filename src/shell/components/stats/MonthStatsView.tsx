import { Center, Loader, SimpleGrid, Stack } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { trackerColorValue } from "../../../data/trackerColors.ts";
import { buildMonthStats } from "../../../services/stats/monthStatsData.ts";
import type { TrendTracker } from "../../../services/stats/monthStatsData.ts";
import { routineAdherence } from "../../../services/stats/routineAdherence.ts";
import { monthLongestStreaks } from "../../../services/stats/streaks.ts";
import {
  tagBreakdown,
  timeOfDayDistribution,
  weekdayCompletion,
} from "../../../services/stats/taskAnalytics.ts";
import { monthTrackerAverages } from "../../../services/stats/trackerStats.ts";
import { currentMonthId } from "../../../services/time.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useRoutinesStore } from "../../../state/routinesStore.ts";
import { useStatsStore } from "../../../state/statsStore.ts";
import { useTagsStore } from "../../../state/tagsStore.ts";
import { useTrackersStore } from "../../../state/trackersStore.ts";
import { EmptyState } from "../common/EmptyState.tsx";
import { SparkleDoodle } from "../common/doodles.tsx";
import { trackerDisplayName } from "../trackers/trackerName.ts";
import { CompletedPerDayChart } from "./CompletedPerDayChart.tsx";
import { CompletionRing } from "./CompletionRing.tsx";
import { HabitConsistencyList } from "./HabitConsistencyList.tsx";
import { HabitMonthList } from "./HabitMonthList.tsx";
import { HabitStreaks } from "./HabitStreaks.tsx";
import { MonthComparison } from "./MonthComparison.tsx";
import { RoutineAdherenceList } from "./RoutineAdherenceList.tsx";
import { StatCard } from "./StatCard.tsx";
import { StatTile } from "./StatTile.tsx";
import { TimeOfDayChart } from "./TimeOfDayChart.tsx";
import { TagBreakdownList } from "./TagBreakdownList.tsx";
import { TrackerAverages } from "./TrackerAverages.tsx";
import { TrackerTrendChart } from "./TrackerTrendChart.tsx";
import { WeekdayChart } from "./WeekdayChart.tsx";

export const MonthStatsView = () => {
  const { t } = useTranslation(["stats", "trackers"]);
  const monthId = useStatsStore((state) => state.monthId);
  const monthStats = useStatsStore((state) => state.monthStats);
  const monthWeeks = useStatsStore((state) => state.monthWeeks);
  const monthCreated = useStatsStore((state) => state.monthCreated);
  const monthPrevCompleted = useStatsStore((state) => state.monthPrevCompleted);
  const monthDoneTasks = useStatsStore((state) => state.monthDoneTasks);
  const monthDayTasks = useStatsStore((state) => state.monthDayTasks);
  const carriedTasks = useStatsStore((state) => state.carriedTasks);
  const monthStatus = useStatsStore((state) => state.monthStatus);
  const moduleToggles = useProfileStore((state) => state.moduleToggles);
  const habits = useHabitsStore((state) => state.habits);
  const currentStreaks = useHabitsStore((state) => state.streaks);
  const trackers = useTrackersStore((state) => state.trackers);
  const routines = useRoutinesStore((state) => state.routines);
  const tags = useTagsStore((state) => state.tags);

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

  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.archived),
    [habits],
  );

  const view = useMemo(
    () =>
      monthId
        ? buildMonthStats({
            monthId,
            stats: monthStats,
            weeks: monthWeeks,
            created: monthCreated,
            carriedTasks,
            habits: activeHabits,
            trackers: trendTrackers,
          })
        : null,
    [
      monthId,
      monthStats,
      monthWeeks,
      monthCreated,
      carriedTasks,
      activeHabits,
      trendTrackers,
    ],
  );

  const weekday = useMemo(
    () => weekdayCompletion(monthStats?.perDay ?? {}),
    [monthStats],
  );
  const timeOfDay = useMemo(
    () => timeOfDayDistribution(monthDoneTasks),
    [monthDoneTasks],
  );
  const tagData = useMemo(
    () => tagBreakdown(monthDoneTasks, tags),
    [monthDoneTasks, tags],
  );
  const adherence = useMemo(
    () =>
      monthId
        ? routineAdherence(monthDayTasks, routines, (key) =>
            key.startsWith(monthId),
          )
        : [],
    [monthDayTasks, routines, monthId],
  );
  const trackerAvg = useMemo(
    () =>
      monthId ? monthTrackerAverages(monthWeeks, trendTrackers, monthId) : [],
    [monthWeeks, trendTrackers, monthId],
  );
  const monthLongest = useMemo(
    () =>
      monthId
        ? monthLongestStreaks(
            monthWeeks,
            activeHabits.map((habit) => ({ id: habit.id, days: habit.days })),
            monthId,
          )
        : {},
    [monthWeeks, activeHabits, monthId],
  );

  if (!view || monthStatus === "loading") {
    return (
      <Center mih="40vh">
        <Loader color="var(--sw-accent)" />
      </Center>
    );
  }

  const showHabits = moduleToggles.habits && view.habits.length > 0;
  const showTrend = view.hasTrend;
  const isEmpty =
    !view.hasTaskData &&
    !showTrend &&
    view.habits.every((habit) => habit.total === 0);

  if (isEmpty) {
    return (
      <EmptyState
        icon={<SparkleDoodle size={40} />}
        label={monthId === currentMonthId() ? t("empty") : t("monthEmpty")}
        minHeight={0}
      />
    );
  }

  const consistency = view.habits.map((habit) => ({
    habitId: habit.habitId,
    name: habit.name,
    icon: habit.icon,
    pct: habit.pct,
  }));
  const showComparison = view.completed > 0 || monthPrevCompleted > 0;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <StatCard title={t("completionTitle")}>
          <CompletionRing completed={view.completed} created={view.created} />
        </StatCard>
        <StatCard title={t("carriedTitle")}>
          <StatTile value={view.carried} caption={t("carriedCaption")} />
        </StatCard>
      </SimpleGrid>

      {showComparison && (
        <StatCard title={t("comparisonTitle")}>
          <MonthComparison
            current={view.completed}
            previous={monthPrevCompleted}
          />
        </StatCard>
      )}

      {view.completed > 0 && (
        <StatCard title={t("completedPerDay")}>
          <CompletedPerDayChart data={view.perDay} />
        </StatCard>
      )}

      {(view.completed > 0 || timeOfDay.total > 0) && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {view.completed > 0 && (
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

      {(showTrend || trackerAvg.length > 0) && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {showTrend && (
            <StatCard title={t("trendTitle")}>
              <TrackerTrendChart data={view.trend} series={view.trendSeries} />
            </StatCard>
          )}
          {trackerAvg.length > 0 && (
            <StatCard title={t("trackerAvgTitle")}>
              <TrackerAverages data={trackerAvg} />
            </StatCard>
          )}
        </SimpleGrid>
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

      {showHabits && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <StatCard title={t("consistencyTitle")}>
            <HabitConsistencyList data={consistency} />
          </StatCard>
          <StatCard title={t("streaksTitle")}>
            <HabitStreaks
              habits={activeHabits}
              longest={monthLongest}
              current={currentStreaks}
            />
          </StatCard>
        </SimpleGrid>
      )}

      {showHabits && (
        <StatCard title={t("habitsTitle")}>
          <HabitMonthList habits={view.habits} />
        </StatCard>
      )}
    </Stack>
  );
};
