import {
  Box,
  Button,
  CopyButton,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { notifyInfo, notifySuccess } from "../../../services/notify.ts";
import {
  createShare,
  revokeShare,
  shareUrl,
  subscribeOwnerShares,
} from "../../../services/share/shareService.ts";
import type { ShareSummary } from "../../../services/share/shareTypes.ts";
import { isoDateKeyOf } from "../../../services/time.ts";
import { useAuthStore } from "../../../state/authStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { ActionMenu } from "../common/ActionMenu.tsx";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { collectWeek } from "../weekview/collectWeek.ts";

interface ShareDialogProps {
  opened: boolean;
  onClose: () => void;
}

const canWebShare = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

const webShare = (title: string, url: string): void => {
  if (!canWebShare()) return;
  void navigator.share({ title, url }).catch(() => {});
};

export const ShareDialog = ({ opened, onClose }: ShareDialogProps) => {
  const { t } = useTranslation("share");
  const uid = useAuthStore((state) => state.uid);
  const weekId = useWeekStore((state) => state.weekId);
  const modules = useProfileStore((state) => state.moduleToggles);
  const [note, setNote] = useState(false);
  const [trackers, setTrackers] = useState(false);
  const [habits, setHabits] = useState(false);
  const [decorations, setDecorations] = useState(true);
  const [shares, setShares] = useState<ShareSummary[]>([]);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !uid) return;
    const unsubscribe = subscribeOwnerShares(uid, setShares);
    return unsubscribe;
  }, [opened, uid]);

  const close = () => {
    setLastCreatedId(null);
    onClose();
  };

  const weekShares = shares.filter((share) => share.weekId === weekId);

  const create = () => {
    const collected = collectWeek({
      tasks: true,
      note: modules.weekNote && note,
      trackers: modules.dayTrackers && trackers,
      habits: modules.habits && habits,
      decorations,
    });
    if (!collected || !uid) return;
    const id = createShare({
      ownerUid: uid,
      weekId: collected.weekId,
      weekTitle: collected.weekTitle,
      language: collected.language,
      themeId: collected.themeId,
      notebookName: collected.notebookName,
      include: collected.include,
      snapshot: collected.snapshot,
    });
    setLastCreatedId(id);
    notifySuccess("share:createdToast");
  };

  const revoke = (id: string) => {
    revokeShare(id);
    if (lastCreatedId === id) setLastCreatedId(null);
    notifySuccess("share:revokedToast");
  };

  const copyLink = (url: string) => {
    void navigator.clipboard
      ?.writeText(url)
      .then(() => notifyInfo("share:copiedToast"))
      .catch(() => {});
  };

  const lastUrl = lastCreatedId ? shareUrl(lastCreatedId) : null;

  return (
    <ResponsiveDialog opened={opened} onClose={close} title={t("title")}>
      <Stack gap="lg">
        <Stack gap="xs">
          <Text fz="sm" c="var(--sw-ink-2)">
            {t("intro")}
          </Text>
          <Text fz="xs" c="var(--sw-ink-3)">
            {t("tasksAlways")}
          </Text>
          <Stack gap={8} mt={4}>
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
            <Switch
              checked={decorations}
              onChange={(event) => setDecorations(event.currentTarget.checked)}
              label={t("includeDecorations")}
              color="var(--sw-accent)"
            />
          </Stack>
          <Text fz="xs" c="var(--sw-ink-3)">
            {t("privacyNote")}
          </Text>
          <Button onClick={create} disabled={!weekId} mt={4}>
            {t("createAction")}
          </Button>
        </Stack>

        {lastUrl && (
          <Box
            style={{
              backgroundColor: "var(--sw-paper-2)",
              border: "1px solid var(--sw-line)",
              borderRadius: "var(--mantine-radius-md)",
              padding: "var(--mantine-spacing-sm)",
            }}
          >
            <Stack gap="xs">
              <Text fz="sm" fw={600} c="var(--sw-ink)">
                {t("linkReady")}
              </Text>
              <TextInput
                readOnly
                value={lastUrl}
                aria-label={t("linkReady")}
                onFocus={(event) => event.currentTarget.select()}
                styles={{
                  input: {
                    backgroundColor: "var(--sw-card)",
                    borderColor: "var(--sw-line)",
                    color: "var(--sw-ink-2)",
                  },
                }}
              />
              <Group gap="xs">
                <CopyButton value={lastUrl}>
                  {({ copied, copy }) => (
                    <Button
                      variant="light"
                      color="var(--sw-accent)"
                      onClick={() => {
                        copy();
                        notifyInfo("share:copiedToast");
                      }}
                    >
                      {copied ? t("copied") : t("copy")}
                    </Button>
                  )}
                </CopyButton>
                {canWebShare() && (
                  <Button
                    variant="default"
                    onClick={() => webShare(t("shareTitle"), lastUrl)}
                  >
                    {t("shareVia")}
                  </Button>
                )}
              </Group>
            </Stack>
          </Box>
        )}

        {weekShares.length > 0 && (
          <Stack gap="xs">
            <Text fz="sm" fw={600} c="var(--sw-ink-2)">
              {t("activeLinks")}
            </Text>
            {weekShares.map((share) => {
              const url = shareUrl(share.id);
              return (
                <Group
                  key={share.id}
                  justify="space-between"
                  wrap="nowrap"
                  gap="xs"
                  style={{
                    borderBottom: "1px solid var(--sw-line)",
                    paddingBottom: 6,
                  }}
                >
                  <Text fz="sm" c="var(--sw-ink-2)" truncate style={{ minWidth: 0 }}>
                    {t("createdOn", { date: isoDateKeyOf(share.createdAt) })}
                  </Text>
                  <ActionMenu
                    label={t("manageLink")}
                    actions={[
                      {
                        key: "copy",
                        label: t("copy"),
                        onClick: () => copyLink(url),
                      },
                      ...(canWebShare()
                        ? [
                            {
                              key: "share",
                              label: t("shareVia"),
                              onClick: () => webShare(t("shareTitle"), url),
                            },
                          ]
                        : []),
                      {
                        key: "revoke",
                        label: t("revoke"),
                        danger: true,
                        onClick: () => revoke(share.id),
                        confirm: {
                          title: t("revokeConfirmTitle"),
                          body: t("revokeConfirmBody"),
                          confirmLabel: t("revoke"),
                        },
                      },
                    ]}
                  />
                </Group>
              );
            })}
          </Stack>
        )}
      </Stack>
    </ResponsiveDialog>
  );
};
