import { Box, Group, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { WeekDay } from "../../../services/time.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { ActionMenu } from "../common/ActionMenu.tsx";

interface DayHeaderProps {
  day: WeekDay;
  isOff: boolean;
}

export const DayHeader = ({ day, isOff }: DayHeaderProps) => {
  const { t } = useTranslation("week");
  const color = isOff
    ? "var(--sw-ink-3)"
    : day.isToday
      ? "var(--sw-accent-2)"
      : "var(--sw-ink)";
  return (
    <Group justify="space-between" wrap="nowrap" style={{ color }}>
      <Box style={{ position: "relative", display: "inline-block" }}>
        {day.isToday && (
          <svg
            aria-hidden
            viewBox="0 0 100 44"
            preserveAspectRatio="none"
            fill="none"
            style={{
              position: "absolute",
              insetInline: -9,
              insetBlock: -5,
              width: "calc(100% + 18px)",
              height: "calc(100% + 10px)",
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            <path
              d="M16 7 C 42 -1, 78 1, 86 16 C 92 30, 60 41, 32 38 C 8 35, 2 14, 22 8"
              stroke="var(--sw-accent)"
              strokeWidth="1.8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
        <Text fw={700} fz="sm" style={{ position: "relative" }}>
          {day.label}
        </Text>
      </Box>
      <Group gap={4} wrap="nowrap">
        <ActionMenu
          label={t("dayOptions", { day: day.label })}
          iconSize={16}
          actions={[
            {
              key: "dayOff",
              label: isOff ? t("makeWorkday") : t("makeDayOff"),
              onClick: () => useWeekStore.getState().toggleDayOff(day.iso),
            },
          ]}
        />
      </Group>
    </Group>
  );
};
