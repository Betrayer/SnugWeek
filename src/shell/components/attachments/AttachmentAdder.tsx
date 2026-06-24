import { Button, Menu, Stack, Text, UnstyledButton } from "@mantine/core";
import { useId, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { BottomSheet } from "../common/BottomSheet.tsx";
import { LinkDialog } from "./LinkDialog.tsx";
import { VoiceRecorder } from "./VoiceRecorder.tsx";
import {
  FileGlyph,
  ImageGlyph,
  LinkGlyph,
  MicGlyph,
  PlusGlyph,
  VideoGlyph,
} from "../icons/glyphs.tsx";

interface AttachmentAdderProps {
  variant: "panel" | "strip";
  online: boolean;
  onImages: (files: File[]) => void;
  onAudioFiles: (files: File[]) => void;
  onVideoFiles: (files: File[]) => void;
  onFiles: (files: File[]) => void;
  onRecording: (blob: Blob, durationMs: number, name: string) => void;
  onAddLink: (fields: {
    href: string;
    title: string;
    previewImage: string | null;
  }) => void;
}

interface AdderOption {
  key: string;
  label: string;
  icon: ReactNode;
  disabled: boolean;
  inputId?: string;
  run?: () => void;
}

export const AttachmentAdder = ({
  variant,
  online,
  onImages,
  onAudioFiles,
  onVideoFiles,
  onFiles,
  onRecording,
  onAddLink,
}: AttachmentAdderProps) => {
  const { t } = useTranslation("attachments");
  const isMobile = useIsMobile();
  const baseId = useId();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  const imageId = `${baseId}-image`;
  const audioId = `${baseId}-audio`;
  const videoId = `${baseId}-video`;
  const fileId = `${baseId}-file`;

  const pick = (
    handler: (files: File[]) => void,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length > 0) handler(files);
  };

  const options: AdderOption[] = [
    {
      key: "image",
      label: t("addImage"),
      icon: <ImageGlyph size={18} />,
      disabled: !online,
      inputId: imageId,
    },
    {
      key: "record",
      label: t("record"),
      icon: <MicGlyph size={18} />,
      disabled: !online,
      run: () => setRecorderOpen(true),
    },
    {
      key: "audio",
      label: t("addAudio"),
      icon: <MicGlyph size={18} />,
      disabled: !online,
      inputId: audioId,
    },
    {
      key: "video",
      label: t("addVideo"),
      icon: <VideoGlyph size={18} />,
      disabled: !online,
      inputId: videoId,
    },
    {
      key: "file",
      label: t("addFile"),
      icon: <FileGlyph size={18} />,
      disabled: !online,
      inputId: fileId,
    },
    {
      key: "link",
      label: t("addLink"),
      icon: <LinkGlyph size={18} />,
      disabled: false,
      run: () => setLinkOpen(true),
    },
  ];

  const trigger =
    variant === "panel" ? (
      <Button
        variant="light"
        color="var(--sw-accent)"
        size="xs"
        radius="md"
        leftSection={<PlusGlyph size={15} />}
        onClick={isMobile ? () => setSheetOpen(true) : undefined}
        aria-haspopup="menu"
      >
        {t("add")}
      </Button>
    ) : (
      <UnstyledButton
        aria-label={t("add")}
        aria-haspopup="menu"
        onClick={isMobile ? () => setSheetOpen(true) : undefined}
        style={{
          width: 34,
          height: 34,
          flex: "0 0 auto",
          borderRadius: "var(--mantine-radius-md)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--sw-accent-2)",
          backgroundColor: "color-mix(in srgb, var(--sw-accent) 12%, transparent)",
        }}
      >
        <PlusGlyph size={16} />
      </UnstyledButton>
    );

  const hiddenInputs = (
    <>
      <input
        id={imageId}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => pick(onImages, event)}
      />
      <input
        id={audioId}
        type="file"
        accept="audio/*"
        hidden
        onChange={(event) => pick(onAudioFiles, event)}
      />
      <input
        id={videoId}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => pick(onVideoFiles, event)}
      />
      <input
        id={fileId}
        type="file"
        hidden
        onChange={(event) => pick(onFiles, event)}
      />
    </>
  );

  const dialogs = (
    <>
      <VoiceRecorder
        key={recorderOpen ? "recorder-open" : "recorder-closed"}
        opened={recorderOpen}
        onClose={() => setRecorderOpen(false)}
        onSave={onRecording}
      />
      <LinkDialog
        opened={linkOpen}
        onClose={() => setLinkOpen(false)}
        onAdd={onAddLink}
      />
      {hiddenInputs}
    </>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <BottomSheet
          opened={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t("add")}
        >
          <Stack gap={2} pt={4}>
            {options.map((option) => {
              const sharedStyle = {
                display: "flex",
                alignItems: "center",
                gap: 12,
                minHeight: 48,
                padding: "0 12px",
                borderRadius: "var(--mantine-radius-md)",
                color: "var(--sw-ink)",
                opacity: option.disabled ? 0.4 : 1,
                fontWeight: 600,
                cursor: option.disabled ? "not-allowed" : "pointer",
              } as const;
              const body = (
                <>
                  <span style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </>
              );
              if (option.disabled) {
                return (
                  <span key={option.key} style={sharedStyle}>
                    {body}
                  </span>
                );
              }
              if (option.inputId) {
                return (
                  <UnstyledButton
                    key={option.key}
                    component="label"
                    htmlFor={option.inputId}
                    onClick={() => setSheetOpen(false)}
                    style={sharedStyle}
                  >
                    {body}
                  </UnstyledButton>
                );
              }
              return (
                <UnstyledButton
                  key={option.key}
                  onClick={() => {
                    setSheetOpen(false);
                    option.run?.();
                  }}
                  style={sharedStyle}
                >
                  {body}
                </UnstyledButton>
              );
            })}
            {!online && (
              <Text fz="xs" c="var(--sw-ink-3)" px={12} pt={6}>
                {t("offlineHint")}
              </Text>
            )}
          </Stack>
        </BottomSheet>
        {dialogs}
      </>
    );
  }

  return (
    <>
      <Menu position="bottom-start" radius="md" withinPortal>
        <Menu.Target>{trigger}</Menu.Target>
        <Menu.Dropdown>
          {options.map((option) => {
            const leftSection = (
              <span style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
                {option.icon}
              </span>
            );
            if (option.disabled) {
              return (
                <Menu.Item key={option.key} disabled leftSection={leftSection}>
                  {option.label}
                </Menu.Item>
              );
            }
            if (option.inputId) {
              return (
                <Menu.Item
                  key={option.key}
                  component="label"
                  htmlFor={option.inputId}
                  leftSection={leftSection}
                >
                  {option.label}
                </Menu.Item>
              );
            }
            return (
              <Menu.Item
                key={option.key}
                leftSection={leftSection}
                onClick={option.run}
              >
                {option.label}
              </Menu.Item>
            );
          })}
          {!online && (
            <Text fz="xs" c="var(--sw-ink-3)" px="sm" pt={6} maw={220}>
              {t("offlineHint")}
            </Text>
          )}
        </Menu.Dropdown>
      </Menu>
      {dialogs}
    </>
  );
};
