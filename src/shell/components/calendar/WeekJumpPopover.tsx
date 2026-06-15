import { Center, Loader, Popover, UnstyledButton } from "@mantine/core";
import { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { playFlip } from "../../../services/sound/soundService.ts";
import { weekIdFromKey, weekTitle } from "../../../services/time.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";

const WeekJumpCalendar = lazy(() =>
  import("./WeekJumpCalendar.tsx").then((module) => ({
    default: module.WeekJumpCalendar,
  })),
);

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
    playFlip();
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
        <Suspense
          fallback={
            <Center mih={300} miw={252}>
              <Loader size="sm" color="var(--sw-accent)" />
            </Center>
          }
        >
          <WeekJumpCalendar
            weekId={weekId}
            language={language}
            activeWeek={activeWeek}
            onHover={setHovered}
            onPick={pick}
            onJumpMonth={() => setOpened(false)}
          />
        </Suspense>
      </Popover.Dropdown>
    </Popover>
  );
};
