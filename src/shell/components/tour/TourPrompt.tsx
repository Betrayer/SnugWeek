import { Button, Dialog, Group, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { currentWeekId } from "../../../services/time.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useTourStore } from "../../../state/tourStore.ts";

const SHOW_DELAY_MS = 900;

export const TourPrompt = () => {
  const { t } = useTranslation("tour");
  const navigate = useNavigate();
  const tourSeen = useSettingsStore((state) => state.tourSeen);
  const profileLoaded = useProfileStore((state) => state.loaded);
  const running = useTourStore((state) => state.running);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (tourSeen || !profileLoaded || running) return;
    const timer = window.setTimeout(() => setArmed(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [tourSeen, profileLoaded, running]);

  const decline = () => {
    useSettingsStore.getState().setTourSeen(true);
  };

  const accept = () => {
    useSettingsStore.getState().setTourSeen(true);
    navigate(`/w/${currentWeekId()}`);
    useTourStore.getState().start();
  };

  return (
    <Dialog
      opened={armed && !tourSeen && !running && profileLoaded}
      onClose={decline}
      withCloseButton
      withBorder
      radius="lg"
      size="lg"
      position={{ bottom: 20, right: 20 }}
      styles={{
        root: {
          backgroundColor: "var(--sw-card)",
          borderColor: "var(--sw-line)",
          maxWidth: "calc(100vw - 32px)",
        },
        closeButton: { color: "var(--sw-ink-3)" },
      }}
    >
      <Stack gap="sm">
        <Text ff="var(--sw-font-hand)" fz={26} fw={600} c="var(--sw-ink)" lh={1.1}>
          {t("promptTitle")}
        </Text>
        <Text fz="sm" c="var(--sw-ink-2)" lh={1.45}>
          {t("promptBody")}
        </Text>
        <Group justify="flex-end" gap="xs" mt={2}>
          <Button variant="subtle" size="compact-sm" c="var(--sw-ink-3)" onClick={decline}>
            {t("promptDecline")}
          </Button>
          <Button
            size="compact-sm"
            onClick={accept}
            styles={{
              root: {
                backgroundColor: "var(--sw-accent)",
                color: "var(--sw-accent-ink)",
              },
            }}
          >
            {t("promptAccept")}
          </Button>
        </Group>
      </Stack>
    </Dialog>
  );
};
