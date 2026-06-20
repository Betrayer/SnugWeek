import {
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  clearLockSecret,
  passkeySupported,
  registerPasskey,
} from "../../../../services/lock/lockService.ts";
import { notifySuccess } from "../../../../services/notify.ts";
import { useLockStore } from "../../../../state/lockStore.ts";
import { useProfileStore } from "../../../../state/profileStore.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";
import { PinSetupDialog } from "../../lock/PinSetupDialog.tsx";

const AUTO_LOCK_OPTIONS = [1, 5, 15, 30];

export const LockSection = () => {
  const { t } = useTranslation("lock");
  const lockEnabled = useSettingsStore((state) => state.lockEnabled);
  const lockMethod = useSettingsStore((state) => state.lockMethod);
  const lockAfterMin = useSettingsStore((state) => state.lockAfterMin);
  const notebookName = useProfileStore((state) => state.notebookName);
  const supportsPasskey = useMemo(() => passkeySupported(), []);
  const [chosen, setChosen] = useState<"pin" | "passkey">("pin");
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupKey, setSetupKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState(false);

  const openSetup = () => {
    setSetupKey((value) => value + 1);
    setSetupOpen(true);
  };

  const enablePasskey = () => {
    setBusy(true);
    setPasskeyError(false);
    void registerPasskey(notebookName ?? "SnugWeek")
      .then((ok) => {
        if (!ok) {
          setPasskeyError(true);
          return;
        }
        const settings = useSettingsStore.getState();
        settings.setLockMethod("passkey");
        settings.setLockEnabled(true);
        notifySuccess("lock:savedToast");
      })
      .catch(() => setPasskeyError(true))
      .finally(() => setBusy(false));
  };

  const startSetup = () => {
    if (chosen === "passkey") {
      enablePasskey();
      return;
    }
    openSetup();
  };

  const onPinDone = () => {
    const settings = useSettingsStore.getState();
    settings.setLockMethod("pin");
    settings.setLockEnabled(true);
    notifySuccess("lock:savedToast");
  };

  const lockNow = () => useLockStore.getState().lock();

  const turnOff = () => {
    clearLockSecret();
    const settings = useSettingsStore.getState();
    settings.setLockEnabled(false);
    settings.setLockMethod(null);
    useLockStore.getState().unlock();
  };

  return (
    <Stack gap="lg">
      <Text fz="sm" c="var(--sw-ink-2)">
        {t("intro")}
      </Text>

      {!lockEnabled ? (
        <Stack gap="md" align="flex-start">
          {supportsPasskey && (
            <SegmentedControl
              value={chosen}
              onChange={(value) => {
                if (value === "pin" || value === "passkey") setChosen(value);
              }}
              data={[
                { value: "pin", label: t("method.pin") },
                { value: "passkey", label: t("method.passkey") },
              ]}
            />
          )}
          {passkeyError && (
            <Text fz="sm" c="var(--sw-danger)">
              {t("passkeyFailed")}
            </Text>
          )}
          <Button
            radius="md"
            loading={busy}
            onClick={startSetup}
            styles={{
              root: {
                backgroundColor: "var(--sw-accent)",
                color: "var(--sw-accent-ink)",
              },
            }}
          >
            {t("enable")}
          </Button>
        </Stack>
      ) : (
        <Stack gap="lg" align="flex-start">
          <Text c="var(--sw-ink-2)">
            {t("statusEnabled", {
              method: t(lockMethod === "passkey" ? "method.passkey" : "method.pin"),
            })}
          </Text>
          <Stack gap="xs">
            <Text fw={600}>{t("autoLock.label")}</Text>
            <SegmentedControl
              value={String(lockAfterMin)}
              onChange={(value) =>
                useSettingsStore.getState().setLockAfterMin(Number(value))
              }
              data={AUTO_LOCK_OPTIONS.map((minutes) => ({
                value: String(minutes),
                label: `${minutes} ${t("minutesShort")}`,
              }))}
            />
          </Stack>
          <Group>
            <Button variant="light" color="var(--sw-accent)" onClick={lockNow}>
              {t("lockNow")}
            </Button>
            {lockMethod === "pin" && (
              <Button variant="default" onClick={openSetup}>
                {t("changePin")}
              </Button>
            )}
            {lockMethod === "passkey" && (
              <Button
                variant="default"
                loading={busy}
                onClick={enablePasskey}
              >
                {t("reRegister")}
              </Button>
            )}
            <Button variant="light" color="var(--sw-danger)" onClick={turnOff}>
              {t("turnOff")}
            </Button>
          </Group>
        </Stack>
      )}

      <PinSetupDialog
        key={setupKey}
        opened={setupOpen}
        onClose={() => setSetupOpen(false)}
        onComplete={onPinDone}
      />
    </Stack>
  );
};
