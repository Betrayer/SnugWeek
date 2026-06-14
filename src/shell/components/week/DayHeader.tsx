import { ActionIcon, Box, Group, Menu, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { WeekDay } from "../../../services/time.ts";
import { useWeekStore } from "../../../state/weekStore.ts";

interface DayHeaderProps {
  day: WeekDay;
  isOff: boolean;
}

const KebabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

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
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="var(--sw-ink-3)"
              size="sm"
              aria-label={t("dayOptions", { day: day.label })}
            >
              <KebabIcon />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => useWeekStore.getState().toggleDayOff(day.iso)}
            >
              {isOff ? t("makeWorkday") : t("makeDayOff")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};
