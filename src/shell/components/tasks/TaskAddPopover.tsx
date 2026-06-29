import { ActionIcon, Popover } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
import type { WeekDay } from "../../../services/time.ts";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { BottomSheet } from "../common/BottomSheet.tsx";
import { PlusGlyph } from "../icons/glyphs.tsx";
import { TaskComposer } from "./TaskComposer.tsx";

interface TaskAddPopoverProps {
  day: WeekDay;
  onAdd: (title: string) => void;
}

export const TaskAddPopover = ({ day, onAdd }: TaskAddPopoverProps) => {
  const { t } = useTranslation("tasks");
  const isMobile = useIsMobile();
  const [opened, setOpened] = useState(false);

  const close = () => setOpened(false);

  const composer = (
    <TaskComposer
      active
      onActiveChange={(next) => {
        if (!next) close();
      }}
      onAdd={onAdd}
    />
  );

  if (isMobile) {
    return (
      <>
        <ActionIcon
          variant="subtle"
          color="var(--sw-ink-3)"
          size="sm"
          aria-label={t("quickAdd.title", { day: day.label })}
          data-sw-add-day={day.iso}
          data-tour={TOUR_ANCHORS.addTask}
          onClick={() => setOpened(true)}
        >
          <PlusGlyph size={16} />
        </ActionIcon>
        <BottomSheet
          opened={opened}
          onClose={close}
          title={t("quickAdd.title", { day: day.label })}
        >
          {composer}
        </BottomSheet>
      </>
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={6}
      withArrow
      trapFocus
      radius="md"
      shadow="md"
      width={232}
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="var(--sw-ink-3)"
          size="sm"
          aria-label={t("quickAdd.title", { day: day.label })}
          data-sw-add-day={day.iso}
          data-tour={TOUR_ANCHORS.addTask}
          onClick={() => setOpened((value) => !value)}
        >
          <PlusGlyph size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p="xs" style={{ backgroundColor: "var(--sw-card)" }}>
        {composer}
      </Popover.Dropdown>
    </Popover>
  );
};
