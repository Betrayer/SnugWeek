import { Button, Group, Slider, Stack, Text } from "@mantine/core";
import { useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";

export interface CropResult {
  cropX: number;
  cropY: number;
  cropZoom: number;
}

interface PhotoCropChooserProps {
  opened: boolean;
  src: string | null;
  name: string | null;
  total: number;
  index: number;
  initial?: CropResult;
  confirmLabel?: string;
  onConfirm: (crop: CropResult) => void;
  onCancel: () => void;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const clampPct = (value: number): number => Math.min(100, Math.max(0, value));
const clampZoom = (value: number): number =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  rectW: number;
  rectH: number;
}

export const PhotoCropChooser = ({
  opened,
  src,
  name,
  total,
  index,
  initial,
  confirmLabel,
  onConfirm,
  onCancel,
}: PhotoCropChooserProps) => {
  const { t } = useTranslation("attachments");
  const [cropX, setCropX] = useState(initial?.cropX ?? 50);
  const [cropY, setCropY] = useState(initial?.cropY ?? 50);
  const [zoom, setZoom] = useState(initial?.cropZoom ?? 1);
  const [seenSrc, setSeenSrc] = useState(src);
  const dragRef = useRef<DragState | null>(null);

  if (seenSrc !== src) {
    setSeenSrc(src);
    setCropX(initial?.cropX ?? 50);
    setCropY(initial?.cropY ?? 50);
    setZoom(initial?.cropZoom ?? 1);
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: cropX,
      originY: cropY,
      rectW: rect.width,
      rectH: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.rectW === 0 || drag.rectH === 0) return;
    const dx = ((event.clientX - drag.startX) / drag.rectW) * 100;
    const dy = ((event.clientY - drag.startY) / drag.rectH) * 100;
    setCropX(clampPct(drag.originX - dx));
    setCropY(clampPct(drag.originY - dy));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    setZoom((current) => clampZoom(current - event.deltaY * 0.002));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 5 : 2;
    if (event.key === "ArrowLeft") setCropX((value) => clampPct(value - step));
    else if (event.key === "ArrowRight")
      setCropX((value) => clampPct(value + step));
    else if (event.key === "ArrowUp") setCropY((value) => clampPct(value - step));
    else if (event.key === "ArrowDown")
      setCropY((value) => clampPct(value + step));
    else if (event.key === "+" || event.key === "=")
      setZoom((value) => clampZoom(value + 0.1));
    else if (event.key === "-" || event.key === "_")
      setZoom((value) => clampZoom(value - 0.1));
    else return;
    event.preventDefault();
  };

  const confirm = () =>
    onConfirm({
      cropX: Math.round(cropX),
      cropY: Math.round(cropY),
      cropZoom: Math.round(zoom * 100) / 100,
    });

  return (
    <ResponsiveDialog opened={opened} onClose={onCancel} title={t("crop.title")}>
      <Stack gap="md">
        {total > 1 && (
          <Text fz="xs" c="var(--sw-ink-3)">
            {t("crop.counter", { index: index + 1, total })}
          </Text>
        )}
        <div
          role="group"
          aria-label={t("crop.viewport")}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
          onKeyDown={onKeyDown}
          style={{
            position: "relative",
            width: "min(78vw, 360px)",
            maxWidth: "100%",
            aspectRatio: "1 / 1",
            margin: "0 auto",
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
            backgroundColor: "var(--sw-paper-2)",
            cursor: "grab",
            touchAction: "none",
            outline: "2px solid var(--sw-line)",
          }}
        >
          {src && (
            <img
              src={src}
              alt={name ?? ""}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                objectPosition: `${cropX}% ${cropY}%`,
                transform: zoom > 1 ? `scale(${zoom})` : undefined,
                transformOrigin: `${cropX}% ${cropY}%`,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
        <Text fz="xs" c="var(--sw-ink-3)" ta="center">
          {t("crop.hint")}
        </Text>
        <Stack gap={4}>
          <Text fz="sm" fw={600} c="var(--sw-ink-2)">
            {t("crop.zoom")}
          </Text>
          <Slider
            value={zoom}
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.05}
            label={null}
            aria-label={t("crop.zoom")}
            color="var(--sw-accent)"
            onChange={setZoom}
          />
        </Stack>
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" c="var(--sw-ink-2)" onClick={onCancel}>
            {t("crop.skip")}
          </Button>
          <Button color="var(--sw-accent)" onClick={confirm}>
            {confirmLabel ?? t("crop.confirm")}
          </Button>
        </Group>
      </Stack>
    </ResponsiveDialog>
  );
};
