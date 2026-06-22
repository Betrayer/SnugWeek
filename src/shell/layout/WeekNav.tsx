import { ActionIcon, Button, Group } from "@mantine/core";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { playFlip } from "../../services/sound/soundService.ts";
import { todayIsoDay } from "../../services/time.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { WeekJumpPopover } from "../components/calendar/WeekJumpPopover.tsx";
import { useWeekParam } from "../hooks/useWeekParam.ts";
import { ChevronLeftGlyph, ChevronRightGlyph } from "../components/icons/glyphs.tsx";

export const WeekNav = () => {
  const { t } = useTranslation(["week", "common"]);
  const { weekId, isCurrent, goTo, next, prev, today } = useWeekParam();

  const goPrev = () => {
    playFlip();
    prev();
  };

  const goNext = () => {
    playFlip();
    next();
  };

  const goToday = () => {
    playFlip();
    useUiStore.getState().setActiveMobileDay(todayIsoDay());
    today();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        playFlip();
        prev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        playFlip();
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
        onClick={goPrev}
      >
        <ChevronLeftGlyph size={18} strokeWidth={2} />
      </ActionIcon>
      <WeekJumpPopover weekId={weekId} onPick={goTo} />
      <ActionIcon
        variant="subtle"
        color="var(--sw-ink-2)"
        aria-label={t("week:nextWeek")}
        onClick={goNext}
      >
        <ChevronRightGlyph size={18} strokeWidth={2} />
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
