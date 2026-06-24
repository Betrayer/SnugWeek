import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import {
  hasAskedNotif,
  markAskedNotif,
  notifPermission,
  notifSupported,
  requestNotif,
} from "../../../services/reminders/notificationPermission.ts";
import { REMINDER_OFFSETS, offsetKey } from "../../../services/reminders/offsets.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { TimeField } from "../common/TimeField.tsx";
import { fieldStyles } from "../../styles/fieldStyles.ts";

const NONE = "none";

export const TaskTimeReminder = ({ task }: { task: Task }) => {
  const { t } = useTranslation("reminders");
  const defaultOffset = useSettingsStore(
    (state) => state.defaultReminderOffsetMin,
  );
  const setTime = useWeekStore((state) => state.setTime);
  const setReminder = useWeekStore((state) => state.setReminder);
  const [permissionOpen, setPermissionOpen] = useState(false);

  const hasTime = task.time !== null;

  const offsetLabel = (minutes: number): string =>
    t(`offsets.${offsetKey(minutes)}`);

  const reminderData = [
    { value: NONE, label: t("offsets.none") },
    ...REMINDER_OFFSETS.map((minutes) => ({
      value: String(minutes),
      label: offsetLabel(minutes),
    })),
  ];

  const maybeAskPermission = () => {
    if (notifSupported() && notifPermission() === "default" && !hasAskedNotif()) {
      setPermissionOpen(true);
    }
  };

  const onReminderChange = (value: string | null) => {
    const offset = value === null || value === NONE ? null : Number(value);
    setReminder(task.id, offset);
    if (offset !== null) maybeAskPermission();
  };

  const dismissPermission = () => {
    markAskedNotif();
    setPermissionOpen(false);
  };

  const allowPermission = () => {
    void requestNotif().finally(() => setPermissionOpen(false));
  };

  return (
    <Stack gap="sm" data-hint="reminders">
      <TimeField
        label={t("timeLabel")}
        value={task.time}
        onChange={(value) => setTime(task.id, value)}
      />

      <Select
        label={t("reminderLabel")}
        data={reminderData}
        value={task.remindOffsetMin === null ? NONE : String(task.remindOffsetMin)}
        onChange={onReminderChange}
        disabled={!hasTime}
        allowDeselect={false}
        comboboxProps={{ withinPortal: true }}
        styles={fieldStyles}
      />

      <Text fz="xs" c="var(--sw-ink-3)">
        {t("defaultHint", { label: offsetLabel(defaultOffset) })}
      </Text>
      <Text fz="xs" c="var(--sw-ink-3)">
        {t("orderHint")}
      </Text>

      <ResponsiveDialog
        opened={permissionOpen}
        onClose={dismissPermission}
        title={t("permTitle")}
      >
        <Stack gap="md">
          <Text c="var(--sw-ink-2)">{t("permBody")}</Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="var(--sw-ink-2)"
              onClick={dismissPermission}
            >
              {t("permNotNow")}
            </Button>
            <Button color="var(--sw-accent)" onClick={allowPermission}>
              {t("permAllow")}
            </Button>
          </Group>
        </Stack>
      </ResponsiveDialog>
    </Stack>
  );
};
