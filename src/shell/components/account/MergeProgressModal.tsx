import { Button, Group, Loader, Modal, Progress, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccountStore } from "../../../state/accountStore.ts";

const DONE_VISIBLE_MS = 1400;

export const MergeProgressModal = () => {
  const { t } = useTranslation("auth");
  const phase = useAccountStore((state) => state.mergePhase);
  const done = useAccountStore((state) => state.mergeDone);
  const total = useAccountStore((state) => state.mergeTotal);
  const mergeError = useAccountStore((state) => state.mergeError);
  const open = phase !== "idle";

  useEffect(() => {
    if (phase !== "done") return;
    const timer = setTimeout(() => {
      useAccountStore.getState().dismissMerge();
    }, DONE_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Modal
      opened={open}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      radius="lg"
      styles={{ content: { backgroundColor: "var(--sw-paper)" } }}
    >
      <Stack gap="md" py="xs" align="center">
        {phase === "error" ? (
          <Text fz={40} aria-hidden>
            🙈
          </Text>
        ) : phase === "done" ? (
          <Text fz={40} aria-hidden>
            🎉
          </Text>
        ) : (
          <Loader color="var(--sw-accent)" />
        )}

        <Text fw={600} c="var(--sw-ink)" ta="center">
          {phase === "signing-in" && t("progress.signingIn")}
          {phase === "transferring" && t("progress.transferring")}
          {phase === "done" && t("progress.done")}
          {phase === "error" && t("progress.error")}
        </Text>

        {phase === "transferring" && (
          <Stack gap={4} w="100%">
            <Progress
              value={percent}
              color="var(--sw-accent)"
              radius="xl"
              transitionDuration={200}
            />
            <Text fz="xs" c="var(--sw-ink-3)" ta="center">
              {t("progress.count", { done, total })}
            </Text>
          </Stack>
        )}

        {phase === "error" && (
          <Stack gap="sm" w="100%">
            {mergeError && (
              <Text fz="sm" c="var(--sw-danger)" ta="center">
                {t(`errors.${mergeError}`)}
              </Text>
            )}
            <Group justify="center" gap="sm">
              <Button
                variant="subtle"
                color="var(--sw-ink-2)"
                onClick={() => useAccountStore.getState().dismissMerge()}
              >
                {t("merge.cancel")}
              </Button>
              <Button
                color="var(--sw-accent)"
                onClick={() => {
                  const store = useAccountStore.getState();
                  void (store.mergeSkip
                    ? store.signInWithoutMerge()
                    : store.confirmMerge());
                }}
              >
                {t("progress.retry")}
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};
