import { Anchor, Stack } from "@mantine/core";
import { Calendar, DatesProvider } from "@mantine/dates";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  isoDateKey,
  isoDayOfKey,
  monthIdOfWeek,
  weekIdFromKey,
} from "../../../services/time.ts";

interface WeekJumpCalendarProps {
  weekId: string;
  language: string;
  activeWeek: string;
  onHover: (dateKey: string | null) => void;
  onPick: (dateKey: string) => void;
  onJumpMonth: () => void;
}

export const WeekJumpCalendar = ({
  weekId,
  language,
  activeWeek,
  onHover,
  onPick,
  onJumpMonth,
}: WeekJumpCalendarProps) => {
  const { t } = useTranslation("week");
  return (
    <Stack gap="xs">
      <DatesProvider settings={{ locale: language, firstDayOfWeek: 1 }}>
        <div onMouseLeave={() => onHover(null)}>
          <Calendar
            defaultDate={isoDateKey(weekId, 4)}
            highlightToday
            getDayProps={(dateKey) => {
              const inWeek = weekIdFromKey(dateKey) === activeWeek;
              const iso = isoDayOfKey(dateKey);
              return {
                inRange: inWeek,
                firstInRange: inWeek && iso === 1,
                lastInRange: inWeek && iso === 7,
                onMouseEnter: () => onHover(dateKey),
                onClick: () => onPick(dateKey),
              };
            }}
          />
        </div>
      </DatesProvider>
      <Anchor
        component={Link}
        to={`/month/${monthIdOfWeek(weekId)}`}
        onClick={onJumpMonth}
        c="var(--sw-accent-2)"
        fw={600}
        fz="sm"
        ta="center"
      >
        {t("jumpToMonth")}
      </Anchor>
    </Stack>
  );
};
