import { Stack, Text } from "@mantine/core";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { PIN_LENGTH, setPin } from "../../../services/lock/lockService.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { PinPad } from "./PinPad.tsx";

interface PinSetupDialogProps {
  opened: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PinSetupDialog = ({
  opened,
  onClose,
  onComplete,
}: PinSetupDialogProps) => {
  const { t } = useTranslation("lock");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [first, setFirst] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCreate = useCallback((pin: string) => {
    setFirst(pin);
    setMismatch(false);
    setStep("confirm");
  }, []);

  const handleConfirm = useCallback(
    (pin: string) => {
      if (pin !== first) {
        setMismatch(true);
        setFirst("");
        setStep("create");
        return;
      }
      setBusy(true);
      void setPin(pin)
        .then(() => {
          onComplete();
          onClose();
        })
        .finally(() => setBusy(false));
    },
    [first, onComplete, onClose],
  );

  return (
    <ResponsiveDialog opened={opened} onClose={onClose} title={t("setup.title")}>
      <Stack align="center" gap="lg" py="sm">
        <Text fz="sm" c="var(--sw-ink-2)">
          {step === "create" ? t("setup.create") : t("setup.confirm")}
        </Text>
        {mismatch && (
          <Text fz="sm" c="var(--sw-danger)">
            {t("setup.mismatch")}
          </Text>
        )}
        <PinPad
          key={step}
          length={PIN_LENGTH}
          onComplete={step === "create" ? handleCreate : handleConfirm}
          busy={busy}
          shakeSignal={0}
          ariaLabel={step === "create" ? t("setup.create") : t("setup.confirm")}
        />
      </Stack>
    </ResponsiveDialog>
  );
};
