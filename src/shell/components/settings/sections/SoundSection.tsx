import { Slider, Stack, Switch, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { playPop, setVolume } from "../../../../services/sound/soundService.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";

export const SoundSection = () => {
  const { t } = useTranslation("settings");
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const soundVolume = useSettingsStore((state) => state.soundVolume);
  const setSoundVolume = useSettingsStore((state) => state.setSoundVolume);

  return (
    <Stack gap="xs">
      <Switch
        checked={soundEnabled}
        onChange={(event) => setSoundEnabled(event.currentTarget.checked)}
        label={t("soundEnable")}
      />
      <Text fz="sm" c="var(--sw-ink-2)">
        {t("soundVolume")}
      </Text>
      <Slider
        value={Math.round(soundVolume * 100)}
        onChange={(value) => setSoundVolume(value / 100)}
        onChangeEnd={(value) => {
          setVolume(value / 100);
          playPop();
        }}
        min={0}
        max={100}
        step={1}
        disabled={!soundEnabled}
        label={(value) => `${value}%`}
        color="var(--sw-accent)"
        aria-label={t("soundVolume")}
      />
    </Stack>
  );
};
