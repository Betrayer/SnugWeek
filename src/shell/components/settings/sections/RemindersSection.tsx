import { Button, Select, Stack, Switch, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  notifPermission,
  notifSupported,
  requestNotif,
} from "../../../../services/reminders/notificationPermission.ts";
import {
  REMINDER_OFFSETS,
  offsetKey,
} from "../../../../services/reminders/offsets.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";

export const RemindersSection = () => {
  const { t } = useTranslation("reminders");
  const remindersEnabled = useSettingsStore((state) => state.remindersEnabled);
  const setRemindersEnabled = useSettingsStore(
    (state) => state.setRemindersEnabled,
  );
  const defaultOffset = useSettingsStore(
    (state) => state.defaultReminderOffsetMin,
  );
  const setDefaultOffset = useSettingsStore(
    (state) => state.setDefaultReminderOffsetMin,
  );
  const [permission, setPermission] = useState(notifPermission());
  const supported = notifSupported();

  const requestPermission = () => {
    void requestNotif().then((next) => setPermission(next));
  };

  const permissionLabel = !supported
    ? t("settings.permUnsupported")
    : permission === "granted"
      ? t("settings.permGranted")
      : permission === "denied"
        ? t("settings.permDenied")
        : t("settings.permDefault");

  return (
    <Stack gap="lg">
      <Switch
        checked={remindersEnabled}
        onChange={(event) => setRemindersEnabled(event.currentTarget.checked)}
        label={t("settings.enable")}
      />
      <Stack gap="xs">
        <Text fw={600} c="var(--sw-ink)">
          {t("settings.defaultOffset")}
        </Text>
        <Select
          data={REMINDER_OFFSETS.map((minutes) => ({
            value: String(minutes),
            label: t(`offsets.${offsetKey(minutes)}`),
          }))}
          value={String(defaultOffset)}
          onChange={(value) => {
            if (value) setDefaultOffset(Number(value));
          }}
          disabled={!remindersEnabled}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
          maw={260}
        />
      </Stack>
      <Stack gap="xs">
        <Text fz="sm" c="var(--sw-ink-2)">
          {permissionLabel}
        </Text>
        {supported && permission === "default" && (
          <Button
            variant="light"
            color="var(--sw-accent)"
            onClick={requestPermission}
            style={{ alignSelf: "flex-start" }}
          >
            {t("settings.permRequest")}
          </Button>
        )}
      </Stack>
      <Text fz="xs" c="var(--sw-ink-3)">
        {t("settings.note")}
      </Text>
    </Stack>
  );
};
