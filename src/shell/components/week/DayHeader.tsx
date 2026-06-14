import { ActionIcon, Group, Menu, Text } from "@mantine/core";
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
      <Text fw={700} fz="sm">
        {day.label}
      </Text>
      <Group gap={4} wrap="nowrap">
        {day.isToday && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "var(--sw-accent)",
            }}
          />
        )}
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
