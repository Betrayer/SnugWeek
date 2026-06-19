import { Button, List, Modal, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAccountStore } from "../../../state/accountStore.ts";
import type { ExportCounts } from "../../../services/migration.ts";

const countKeys: (keyof ExportCounts)[] = [
  "tasks",
  "lists",
  "weeks",
  "habits",
  "trackers",
];

export const MergeDialog = () => {
  const { t } = useTranslation("auth");
  const pending = useAccountStore((state) => state.pendingMerge);
  const phase = useAccountStore((state) => state.mergePhase);
  const open = pending !== null && phase === "idle";

  const counts = pending?.counts;
  const items = counts
    ? countKeys.filter((key) => counts[key] > 0)
    : [];

  return (
    <Modal
      opened={open}
      onClose={() => useAccountStore.getState().cancelMerge()}
      title={
        <Text ff="var(--sw-font-hand)" fz={26} fw={600} c="var(--sw-ink)">
          {t("merge.title")}
        </Text>
      }
      centered
      radius="lg"
      styles={{ content: { backgroundColor: "var(--sw-paper)" } }}
    >
      <Stack gap="md">
        <Text fz="sm" c="var(--sw-ink-2)">
          {t("merge.body")}
        </Text>

        {items.length > 0 && counts && (
          <List spacing={4} c="var(--sw-ink)" fz="sm">
            {items.map((key) => (
              <List.Item key={key}>
                {t(`merge.count.${key}`, { n: counts[key] })}
              </List.Item>
            ))}
          </List>
        )}

        <Stack gap="sm">
          <Button
            color="var(--sw-accent)"
            onClick={() => void useAccountStore.getState().confirmMerge()}
          >
            {t("merge.confirm")}
          </Button>
          <Button
            variant="default"
            onClick={() => void useAccountStore.getState().signInWithoutMerge()}
          >
            {t("merge.signInOnly")}
          </Button>
          <Button
            variant="subtle"
            color="var(--sw-ink-2)"
            onClick={() => useAccountStore.getState().cancelMerge()}
          >
            {t("merge.cancel")}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
