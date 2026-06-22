import { ActionIcon, Button, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import "@mantine/charts/styles.css";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import {
  addMonths,
  currentMonthId,
  currentYear,
  isValidMonthId,
  isValidYear,
  monthTitle,
  monthsOfYear,
} from "../../services/time.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useStatsStore } from "../../state/statsStore.ts";
import { StatsRecapPanel } from "../components/recap/StatsRecapPanel.tsx";
import { MonthStatsView } from "../components/stats/MonthStatsView.tsx";
import { YearStatsView } from "../components/stats/YearStatsView.tsx";
import { ChevronLeftGlyph, ChevronRightGlyph } from "../components/icons/glyphs.tsx";

export const StatsPage = () => {
  const { t } = useTranslation(["stats", "common"]);
  const [params, setParams] = useSearchParams();
  const uid = useAuthStore((state) => state.uid);

  const raw = params.get("p") ?? "";
  const mode: "month" | "year" = isValidYear(raw) ? "year" : "month";
  const monthId = isValidMonthId(raw) ? raw : currentMonthId();
  const year = isValidYear(raw) ? Number(raw) : currentYear();

  const setPeriod = (value: string) => setParams({ p: value });

  useEffect(() => {
    if (!uid) return;
    if (mode === "month") useStatsStore.getState().openMonth(uid, monthId);
    else useStatsStore.getState().openYear(uid, year);
  }, [uid, mode, monthId, year]);

  const switchMode = (next: string) => {
    if (next === mode) return;
    if (next === "year") {
      setPeriod(monthId.slice(0, 4));
    } else {
      setPeriod(
        year === currentYear()
          ? currentMonthId()
          : (monthsOfYear(year)[0] ?? `${year}-01`),
      );
    }
  };

  const step = (delta: number) => {
    if (mode === "month") setPeriod(addMonths(monthId, delta));
    else setPeriod(String(year + delta));
  };

  const isCurrent =
    mode === "month" ? monthId === currentMonthId() : year === currentYear();
  const title = mode === "month" ? monthTitle(monthId) : String(year);

  return (
    <Stack gap="md">
      <StatsRecapPanel />
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap={4} wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="var(--sw-ink-2)"
            aria-label={t("stats:prevPeriod")}
            onClick={() => step(-1)}
          >
            <ChevronLeftGlyph size={18} strokeWidth={2} />
          </ActionIcon>
          <Text fw={700} fz="lg" c="var(--sw-ink)" style={{ minWidth: 0 }}>
            {title}
          </Text>
          <ActionIcon
            variant="subtle"
            color="var(--sw-ink-2)"
            aria-label={t("stats:nextPeriod")}
            onClick={() => step(1)}
          >
            <ChevronRightGlyph size={18} strokeWidth={2} />
          </ActionIcon>
          {!isCurrent && (
            <Button
              variant="subtle"
              size="compact-sm"
              c="var(--sw-ink-2)"
              onClick={() =>
                setPeriod(
                  mode === "month" ? currentMonthId() : String(currentYear()),
                )
              }
            >
              {t("common:today")}
            </Button>
          )}
        </Group>
        <SegmentedControl
          value={mode}
          onChange={switchMode}
          data={[
            { value: "month", label: t("stats:viewMonth") },
            { value: "year", label: t("stats:viewYear") },
          ]}
        />
      </Group>
      {mode === "month" ? <MonthStatsView /> : <YearStatsView />}
    </Stack>
  );
};
