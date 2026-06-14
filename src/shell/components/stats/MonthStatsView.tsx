import { Center, Loader, SimpleGrid, Stack } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ENERGY_TRACKER_ID,
  MOOD_TRACKER_ID,
} from "../../../services/repos/trackersRepo.ts";
import { buildMonthStats } from "../../../services/stats/monthStatsData.ts";
import { currentMonthId } from "../../../services/time.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useStatsStore } from "../../../state/statsStore.ts";
import { useTrackersStore } from "../../../state/trackersStore.ts";
import { EmptyState } from "../common/EmptyState.tsx";
import { SparkleDoodle } from "../common/doodles.tsx";
import { CompletedPerDayChart } from "./CompletedPerDayChart.tsx";
import { CompletionRing } from "./CompletionRing.tsx";
import { HabitMonthList } from "./HabitMonthList.tsx";
import { StatCard } from "./StatCard.tsx";
import { StatTile } from "./StatTile.tsx";
import { TrackerTrendChart } from "./TrackerTrendChart.tsx";

export const MonthStatsView = () => {
  const { t } = useTranslation("stats");
  const monthId = useStatsStore((state) => state.monthId);
  const monthStats = useStatsStore((state) => state.monthStats);
  const monthWeeks = useStatsStore((state) => state.monthWeeks);
  const monthCreated = useStatsStore((state) => state.monthCreated);
  const carriedTasks = useStatsStore((state) => state.carriedTasks);
  const monthStatus = useStatsStore((state) => state.monthStatus);
  const moduleToggles = useProfileStore((state) => state.moduleToggles);
  const habits = useHabitsStore((state) => state.habits);
  const trackers = useTrackersStore((state) => state.trackers);

  const moodEnabled =
    moduleToggles.dayTrackers &&
    trackers.some((tracker) => tracker.id === MOOD_TRACKER_ID && tracker.enabled);
  const energyEnabled =
    moduleToggles.dayTrackers &&
    trackers.some(
      (tracker) => tracker.id === ENERGY_TRACKER_ID && tracker.enabled,
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
            moodEnabled,
            energyEnabled,
          })
        : null,
    [
      monthId,
      monthStats,
      monthWeeks,
      monthCreated,
      carriedTasks,
      activeHabits,
      moodEnabled,
      energyEnabled,
    ],
  );

  if (!view || monthStatus === "loading") {
    return (
      <Center mih="40vh">
        <Loader color="var(--sw-accent)" />
      </Center>
    );
  }

  const showHabits = moduleToggles.habits && view.habits.length > 0;
  const showTrend = view.hasMood || view.hasEnergy;
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

      {view.completed > 0 && (
        <StatCard title={t("completedPerDay")}>
          <CompletedPerDayChart data={view.perDay} />
        </StatCard>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {showTrend && (
          <StatCard title={t("trendTitle")}>
            <TrackerTrendChart
              data={view.trend}
              showMood={view.hasMood}
              showEnergy={view.hasEnergy}
            />
          </StatCard>
        )}
        {showHabits && (
          <StatCard title={t("habitsTitle")}>
            <HabitMonthList habits={view.habits} />
          </StatCard>
        )}
      </SimpleGrid>
    </Stack>
  );
};
