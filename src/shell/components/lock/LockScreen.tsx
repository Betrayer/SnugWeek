import {
  Anchor,
  Box,
  Button,
  Center,
  FocusTrap,
  Stack,
  Text,
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  clearLockSecret,
  configuredMethod,
  PIN_LENGTH,
  verifyPasskey,
  verifyPin,
} from "../../../services/lock/lockService.ts";
import { useLockStore } from "../../../state/lockStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { MoonDoodle } from "../common/doodles.tsx";
import { PinPad } from "./PinPad.tsx";

export const LockScreen = () => {
  const { t } = useTranslation("lock");
  const method = configuredMethod();
  const notebookName = useProfileStore((state) => state.notebookName);
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState(false);
  const [recovery, setRecovery] = useState(false);

  const handlePin = useCallback((pin: string) => {
    setBusy(true);
    void verifyPin(pin)
      .then((ok) => {
        if (ok) useLockStore.getState().unlock();
        else setShake((value) => value + 1);
      })
      .finally(() => setBusy(false));
  }, []);

  const tryPasskey = useCallback(() => {
    setBusy(true);
    setPasskeyError(false);
    void verifyPasskey()
      .then((ok) => {
        if (ok) useLockStore.getState().unlock();
        else setPasskeyError(true);
      })
      .catch(() => setPasskeyError(true))
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    if (method !== "passkey") return;
    const timer = window.setTimeout(tryPasskey, 0);
    return () => window.clearTimeout(timer);
  }, [method, tryPasskey]);

  const resetLock = () => {
    clearLockSecret();
    const settings = useSettingsStore.getState();
    settings.setLockEnabled(false);
    settings.setLockMethod(null);
    useLockStore.getState().unlock();
  };

  return (
    <Box
      pos="fixed"
      inset={0}
      style={{ zIndex: 10000, backgroundColor: "var(--sw-paper)" }}
    >
      <FocusTrap active>
        <Center mih="100dvh" px="lg">
          <Stack align="center" gap="lg" maw={360} style={{ textAlign: "center" }}>
            <span aria-hidden style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
              <MoonDoodle size={64} />
            </span>
            <Text ff="var(--sw-font-hand)" fz={40} c="var(--sw-ink-2)">
              {notebookName || "SnugWeek"}
            </Text>

            {recovery ? (
              <Stack align="center" gap="md">
                <Text fz="sm" c="var(--sw-ink-2)">
                  {t("recovery.body")}
                </Text>
                <Text fz="xs" c="var(--sw-ink-3)">
                  {t("recovery.cloudNote")}
                </Text>
                <Button
                  variant="light"
                  color="var(--sw-danger)"
                  radius="md"
                  onClick={resetLock}
                >
                  {t("recovery.reset")}
                </Button>
                <Anchor
                  component="button"
                  type="button"
                  fz="sm"
                  c="var(--sw-ink-3)"
                  onClick={() => setRecovery(false)}
                >
                  {t("recovery.back")}
                </Anchor>
              </Stack>
            ) : method === "passkey" ? (
              <Stack align="center" gap="md">
                <Text fz="sm" c="var(--sw-ink-2)">
                  {t("passkeyPrompt")}
                </Text>
                {passkeyError && (
                  <Text fz="sm" c="var(--sw-danger)">
                    {t("passkeyFailed")}
                  </Text>
                )}
                <Button
                  radius="md"
                  loading={busy}
                  onClick={tryPasskey}
                  styles={{
                    root: {
                      backgroundColor: "var(--sw-accent)",
                      color: "var(--sw-accent-ink)",
                    },
                  }}
                >
                  {t("unlockPasskey")}
                </Button>
                <Anchor
                  component="button"
                  type="button"
                  fz="sm"
                  c="var(--sw-ink-3)"
                  onClick={() => setRecovery(true)}
                >
                  {t("cantUnlock")}
                </Anchor>
              </Stack>
            ) : (
              <Stack align="center" gap="lg">
                <Text fz="sm" c="var(--sw-ink-2)">
                  {t("pinPrompt")}
                </Text>
                <PinPad
                  key={shake}
                  length={PIN_LENGTH}
                  onComplete={handlePin}
                  busy={busy}
                  shakeSignal={shake}
                  ariaLabel={t("pinPrompt")}
                />
                <Anchor
                  component="button"
                  type="button"
                  fz="sm"
                  c="var(--sw-ink-3)"
                  onClick={() => setRecovery(true)}
                >
                  {t("forgot")}
                </Anchor>
              </Stack>
            )}
          </Stack>
        </Center>
      </FocusTrap>
    </Box>
  );
};
