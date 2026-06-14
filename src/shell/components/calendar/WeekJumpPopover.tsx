import { Anchor, Popover, Stack, UnstyledButton } from "@mantine/core";
import { Calendar, DatesProvider } from "@mantine/dates";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  isoDateKey,
  isoDayOfKey,
  monthIdOfWeek,
  weekIdFromKey,
  weekTitle,
} from "../../../services/time.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";

interface WeekJumpPopoverProps {
  weekId: string;
  onPick: (weekId: string) => void;
}

export const WeekJumpPopover = ({ weekId, onPick }: WeekJumpPopoverProps) => {
  const { t } = useTranslation("week");
  const language = useSettingsStore((state) => state.language);
  const [opened, setOpened] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const activeWeek = hovered ? weekIdFromKey(hovered) : weekId;

  const pick = (dateKey: string) => {
    setOpened(false);
    setHovered(null);
    onPick(weekIdFromKey(dateKey));
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom"
      withArrow
      trapFocus
      shadow="md"
    >
      <Popover.Target>
        <UnstyledButton
          onClick={() => setOpened((value) => !value)}
          aria-label={t("jumpTitle")}
          style={{
            fontWeight: 700,
            color: "var(--sw-ink)",
            fontSize: "var(--mantine-font-size-md)",
            padding: "2px 8px",
            borderRadius: "var(--mantine-radius-sm)",
            whiteSpace: "nowrap",
          }}
        >
          {weekTitle(weekId)}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <Stack gap="xs">
          <DatesProvider settings={{ locale: language, firstDayOfWeek: 1 }}>
            <div onMouseLeave={() => setHovered(null)}>
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
                    onMouseEnter: () => setHovered(dateKey),
                    onClick: () => pick(dateKey),
                  };
                }}
              />
            </div>
          </DatesProvider>
          <Anchor
            component={Link}
            to={`/month/${monthIdOfWeek(weekId)}`}
            onClick={() => setOpened(false)}
            c="var(--sw-accent-2)"
            fw={600}
            fz="sm"
            ta="center"
          >
            {t("jumpToMonth")}
          </Anchor>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
