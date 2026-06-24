import { Button, Group, Stack, Switch, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "../../../state/profileStore.ts";
import type { WeekViewModel } from "../../../services/share/shareTypes.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { collectWeek } from "../weekview/collectWeek.ts";
import { WeekPrintSheet } from "./WeekPrintSheet.tsx";

interface PrintDialogProps {
  opened: boolean;
  onClose: () => void;
}

export const PrintDialog = ({ opened, onClose }: PrintDialogProps) => {
  const { t } = useTranslation("print");
  const modules = useProfileStore((state) => state.moduleToggles);
  const [note, setNote] = useState(true);
  const [trackers, setTrackers] = useState(true);
  const [habits, setHabits] = useState(true);
  const [printModel, setPrintModel] = useState<WeekViewModel | null>(null);

  useEffect(() => {
    if (!printModel) return;
    const frame = window.requestAnimationFrame(() => {
      window.print();
      setPrintModel(null);
      onClose();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [printModel, onClose]);

  const print = () => {
    const collected = collectWeek({
      tasks: true,
      note: modules.weekNote && note,
      trackers: modules.dayTrackers && trackers,
      habits: modules.habits && habits,
      decorations: false,
      lists: false,
    });
    if (collected) setPrintModel(collected.model);
  };

  return (
    <>
      <ResponsiveDialog opened={opened} onClose={onClose} title={t("title")}>
        <Stack gap="md">
          <Text fz="sm" c="var(--sw-ink-2)">
            {t("hint")}
          </Text>
          <Stack gap="xs">
            {modules.weekNote && (
              <Switch
                checked={note}
                onChange={(event) => setNote(event.currentTarget.checked)}
                label={t("includeNotes")}
                color="var(--sw-accent)"
              />
            )}
            {modules.dayTrackers && (
              <Switch
                checked={trackers}
                onChange={(event) => setTrackers(event.currentTarget.checked)}
                label={t("includeTrackers")}
                color="var(--sw-accent)"
              />
            )}
            {modules.habits && (
              <Switch
                checked={habits}
                onChange={(event) => setHabits(event.currentTarget.checked)}
                label={t("includeHabits")}
                color="var(--sw-accent)"
              />
            )}
          </Stack>
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button onClick={print}>{t("printAction")}</Button>
          </Group>
        </Stack>
      </ResponsiveDialog>
      {printModel && <WeekPrintSheet model={printModel} />}
    </>
  );
};
