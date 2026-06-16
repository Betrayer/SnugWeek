import { Group, Slider, Text, UnstyledButton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../../../../services/repos/attachmentsRepo.ts";
import { formatClock } from "../format.ts";
import { PauseGlyph, PlayGlyph } from "../icons.tsx";
import { RemoveButton } from "../RemoveButton.tsx";

interface AudioItemProps {
  attachment: Attachment;
  onRemove: () => void;
}

export const AudioItem = ({ attachment, onRemove }: AudioItemProps) => {
  const { t } = useTranslation("attachments");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(
    attachment.durationMs ? attachment.durationMs / 1000 : 0,
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else void audio.play();
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = value;
    setCurrent(value);
  };

  return (
    <Group
      gap="sm"
      wrap="nowrap"
      style={{
        padding: "8px 10px",
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: "var(--sw-card)",
        border: "1px solid var(--sw-line)",
      }}
    >
      <UnstyledButton
        onClick={toggle}
        aria-label={playing ? t("pause") : t("play")}
        aria-pressed={playing}
        style={{
          width: 36,
          height: 36,
          flex: "0 0 auto",
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--sw-accent-ink)",
          backgroundColor: "var(--sw-accent)",
        }}
      >
        {playing ? <PauseGlyph size={16} /> : <PlayGlyph size={16} />}
      </UnstyledButton>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Slider
          value={Math.min(current, duration || 0)}
          min={0}
          max={duration || 1}
          step={0.05}
          label={null}
          onChange={seek}
          aria-label={attachment.name ?? t("kind.audio")}
          styles={{
            track: { backgroundColor: "var(--sw-line)" },
            bar: { backgroundColor: "var(--sw-accent)" },
            thumb: {
              borderColor: "var(--sw-accent)",
              backgroundColor: "var(--sw-card)",
            },
          }}
        />
        <Group justify="space-between" gap={4} mt={2}>
          <Text fz="xs" c="var(--sw-ink-3)" fw={600}>
            {formatClock(current * 1000)}
          </Text>
          <Text fz="xs" c="var(--sw-ink-3)" fw={600}>
            {formatClock((duration || 0) * 1000)}
          </Text>
        </Group>
      </div>
      <RemoveButton onRemove={onRemove} label={t("remove")} />
      <audio
        ref={audioRef}
        src={attachment.url ?? ""}
        preload="metadata"
        style={{ display: "none" }}
      />
    </Group>
  );
};
