import { Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { notifyInfo } from "../../../services/notify.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { formatClock } from "./format.ts";
import { MicGlyph, StopGlyph } from "../icons/glyphs.tsx";

interface VoiceRecorderProps {
  opened: boolean;
  onClose: () => void;
  onSave: (blob: Blob, durationMs: number, name: string) => void;
}

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
];

const pickMime = (): string => {
  if (typeof MediaRecorder === "undefined") return "";
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return "";
};

type Phase = "idle" | "recording" | "preview";

export const VoiceRecorder = ({ opened, onClose, onSave }: VoiceRecorderProps) => {
  const { t } = useTranslation("attachments");
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const durationRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const reset = () => {
    clearTimer();
    stopTracks();
    recorderRef.current = null;
    chunksRef.current = [];
    blobRef.current = null;
    durationRef.current = 0;
    setElapsed(0);
    setPhase("idle");
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
  };

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMime();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        durationRef.current = Date.now() - startRef.current;
        blobRef.current = blob;
        stopTracks();
        clearTimer();
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setPhase("preview");
      };
      recorderRef.current = recorder;
      startRef.current = Date.now();
      recorder.start();
      setPhase("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startRef.current);
      }, 200);
    } catch {
      notifyInfo("attachments:micDenied");
      onClose();
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const save = () => {
    if (blobRef.current) {
      onSave(blobRef.current, durationRef.current, t("kind.audio"));
    }
    onClose();
  };

  return (
    <ResponsiveDialog opened={opened} onClose={onClose} title={t("record")}>
      <Stack gap="lg" align="center" py="sm">
        {phase === "idle" && (
          <>
            <UnstyledButton
              onClick={() => void startRecording()}
              aria-label={t("record")}
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sw-accent-ink)",
                backgroundColor: "var(--sw-accent)",
              }}
            >
              <MicGlyph size={30} />
            </UnstyledButton>
            <Text fz="sm" c="var(--sw-ink-3)">
              {t("record")}
            </Text>
          </>
        )}

        {phase === "recording" && (
          <>
            <UnstyledButton
              onClick={stopRecording}
              aria-label={t("stop")}
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sw-accent-ink)",
                backgroundColor: "var(--sw-danger)",
              }}
            >
              <StopGlyph size={28} />
            </UnstyledButton>
            <Text ff="var(--sw-font-hand)" fz={28} c="var(--sw-ink-2)">
              {formatClock(elapsed)}
            </Text>
          </>
        )}

        {phase === "preview" && previewUrl && (
          <>
            <audio src={previewUrl} controls style={{ width: "100%" }} />
            <Group justify="center" gap="sm">
              <Button
                variant="subtle"
                c="var(--sw-ink-2)"
                onClick={reset}
              >
                {t("discard")}
              </Button>
              <Button color="var(--sw-accent)" onClick={save}>
                {t("save")}
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </ResponsiveDialog>
  );
};
