import {
  Button,
  FileButton,
  Group,
  List,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { notifySuccess } from "../../../../services/notify.ts";
import {
  buildExport,
  downloadExport,
} from "../../../../services/portability/exportData.ts";
import type { ExportPayload } from "../../../../services/portability/exportData.ts";
import {
  readEnvelope,
  runImport,
} from "../../../../services/portability/importData.ts";
import type {
  ImportCounts,
  ImportErrorCode,
} from "../../../../services/portability/importData.ts";
import { useAuthStore } from "../../../../state/authStore.ts";
import { ResponsiveDialog } from "../../common/ResponsiveDialog.tsx";

type Stage = "idle" | "confirm" | "running" | "done" | "error";

const COUNT_KEYS: (keyof ImportCounts)[] = [
  "tasks",
  "subtasks",
  "lists",
  "weeks",
  "trackers",
  "habits",
  "tags",
  "routines",
  "stats",
  "attachments",
];

export const DataSection = () => {
  const { t } = useTranslation("portability");
  const uid = useAuthStore((state) => state.uid);
  const [exporting, setExporting] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [payload, setPayload] = useState<ExportPayload | null>(null);
  const [counts, setCounts] = useState<ImportCounts | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState<ImportCounts | null>(null);
  const [errorCode, setErrorCode] = useState<ImportErrorCode>("invalidFile");

  const onExport = () => {
    if (!uid || exporting) return;
    setExporting(true);
    void buildExport(uid)
      .then((envelope) => {
        downloadExport(envelope);
        notifySuccess("portability:exportDoneToast");
      })
      .catch((error: unknown) => console.error(error))
      .finally(() => setExporting(false));
  };

  const onPick = (file: File | null) => {
    if (!file) return;
    void file.text().then((text) => {
      const result = readEnvelope(text);
      if (!result.ok) {
        setErrorCode(result.code);
        setStage("error");
        return;
      }
      setPayload(result.payload);
      setCounts(result.counts);
      setStage("confirm");
    });
  };

  const onConfirm = () => {
    if (!uid || !payload) return;
    setStage("running");
    setProgress({ done: 0, total: 0 });
    void runImport(uid, payload, (done, total) =>
      setProgress({ done, total }),
    ).then((result) => {
      if (result.ok) {
        setSummary(result.counts);
        setStage("done");
        notifySuccess("portability:importDoneToast");
      } else {
        setErrorCode(result.code);
        setStage("error");
      }
    });
  };

  const closeDialog = () => {
    if (stage === "running") return;
    setStage("idle");
    setPayload(null);
    setCounts(null);
    setSummary(null);
  };

  const countList = (data: ImportCounts) => (
    <List size="sm" c="var(--sw-ink-2)" withPadding>
      {COUNT_KEYS.filter((key) => data[key] > 0).map((key) => (
        <List.Item key={key}>
          {t(`entity.${key}`)}: {data[key]}
        </List.Item>
      ))}
    </List>
  );

  const percent =
    progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0;

  return (
    <Stack gap="xl">
      <Stack gap="xs" align="flex-start">
        <Text fw={600}>{t("exportTitle")}</Text>
        <Text fz="sm" c="var(--sw-ink-2)">
          {t("exportHint")}
        </Text>
        <Button
          variant="light"
          color="var(--sw-accent)"
          loading={exporting}
          onClick={onExport}
        >
          {t("exportAction")}
        </Button>
      </Stack>

      <Stack gap="xs" align="flex-start">
        <Text fw={600}>{t("importTitle")}</Text>
        <Text fz="sm" c="var(--sw-ink-2)">
          {t("importHint")}
        </Text>
        <FileButton onChange={onPick} accept="application/json,.json">
          {(props) => (
            <Button {...props} variant="default">
              {t("importAction")}
            </Button>
          )}
        </FileButton>
      </Stack>

      <ResponsiveDialog
        opened={stage !== "idle"}
        onClose={closeDialog}
        title={t("importTitle")}
        closeOnClickOutside={stage !== "running"}
        closeOnEscape={stage !== "running"}
      >
        {stage === "confirm" && counts && (
          <Stack gap="md">
            <Text fz="sm" c="var(--sw-ink-2)">
              {t("confirmBody")}
            </Text>
            {countList(counts)}
            <Group justify="flex-end">
              <Button variant="default" onClick={closeDialog}>
                {t("cancel")}
              </Button>
              <Button
                color="var(--sw-accent)"
                onClick={onConfirm}
                styles={{ root: { color: "var(--sw-accent-ink)" } }}
              >
                {t("confirmAction")}
              </Button>
            </Group>
          </Stack>
        )}

        {stage === "running" && (
          <Stack gap="md">
            <Text fz="sm" c="var(--sw-ink-2)">
              {t("running")}
            </Text>
            <Progress value={percent} color="var(--sw-accent)" />
          </Stack>
        )}

        {stage === "done" && summary && (
          <Stack gap="md">
            <Text fz="sm" c="var(--sw-ink)">
              {t("doneBody")}
            </Text>
            {countList(summary)}
            <Group justify="flex-end">
              <Button variant="light" color="var(--sw-accent)" onClick={closeDialog}>
                {t("close")}
              </Button>
            </Group>
          </Stack>
        )}

        {stage === "error" && (
          <Stack gap="md">
            <Text fz="sm" c="var(--sw-danger)">
              {t(`error.${errorCode}`)}
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={closeDialog}>
                {t("close")}
              </Button>
            </Group>
          </Stack>
        )}
      </ResponsiveDialog>
    </Stack>
  );
};
