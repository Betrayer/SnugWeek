import { Button, Divider, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isoDateKeyOf } from "../../../../services/time.ts";
import { useAuthStore } from "../../../../state/authStore.ts";
import { useProfileStore } from "../../../../state/profileStore.ts";
import { useStatsStore } from "../../../../state/statsStore.ts";

export const AboutSection = () => {
  const { t } = useTranslation(["settings", "common"]);
  const uid = useAuthStore((state) => state.uid);
  const statsBackfilledAt = useProfileStore((state) => state.statsBackfilledAt);
  const [backfilling, setBackfilling] = useState(false);

  const runBackfill = () => {
    if (!uid || backfilling) return;
    setBackfilling(true);
    void useStatsStore
      .getState()
      .backfill(uid)
      .then(() => {
        notifications.show({ message: t("settings:backfillDone") });
      })
      .catch((error: unknown) => {
        console.error(error);
        notifications.show({
          message: t("settings:backfillError"),
          withBorder: true,
          styles: { root: { borderColor: "var(--sw-danger)" } },
        });
      })
      .finally(() => {
        setBackfilling(false);
      });
  };

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Text ff="var(--sw-font-hand)" fz={32} c="var(--sw-ink)">
          {t("common:appName")}
        </Text>
        <Text c="var(--sw-ink-2)">{t("settings:aboutTagline")}</Text>
      </Stack>

      <Divider color="var(--sw-line)" />

      <Stack gap="xs">
        <Text fw={600} c="var(--sw-ink-3)">
          {t("settings:dev")}
        </Text>
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("settings:backfillHint")}
        </Text>
        <Group>
          <Button variant="light" loading={backfilling} onClick={runBackfill}>
            {t("settings:backfill")}
          </Button>
        </Group>
        <Text fz="xs" c="var(--sw-ink-3)">
          {statsBackfilledAt
            ? t("settings:backfillAt", { date: isoDateKeyOf(statsBackfilledAt) })
            : t("settings:backfillNever")}
        </Text>
      </Stack>
    </Stack>
  );
};
