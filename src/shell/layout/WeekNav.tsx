import { ActionIcon, Button, Group } from "@mantine/core";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { todayIsoDay } from "../../services/time.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { WeekJumpPopover } from "../components/calendar/WeekJumpPopover.tsx";
import { useWeekParam } from "../hooks/useWeekParam.ts";

const ChevronLeftIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const WeekNav = () => {
  const { t } = useTranslation(["week", "common"]);
  const { weekId, isCurrent, goTo, next, prev, today } = useWeekParam();

  const goToday = () => {
    useUiStore.getState().setActiveMobileDay(todayIsoDay());
    today();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <Group gap={2} wrap="nowrap" style={{ minWidth: 0 }}>
      <ActionIcon
        variant="subtle"
        color="var(--sw-ink-2)"
        aria-label={t("week:prevWeek")}
        onClick={prev}
      >
        <ChevronLeftIcon />
      </ActionIcon>
      <WeekJumpPopover weekId={weekId} onPick={goTo} />
      <ActionIcon
        variant="subtle"
        color="var(--sw-ink-2)"
        aria-label={t("week:nextWeek")}
        onClick={next}
      >
        <ChevronRightIcon />
      </ActionIcon>
      {!isCurrent && (
        <Button
          variant="subtle"
          size="compact-sm"
          c="var(--sw-ink-2)"
          onClick={goToday}
          aria-label={t("common:todayWeek")}
        >
          {t("common:today")}
        </Button>
      )}
    </Group>
  );
};
