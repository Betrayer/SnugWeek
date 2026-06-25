import {
  ActionIcon,
  Popover,
  Select,
  Slider,
  Stack,
  Text,
} from "@mantine/core";
import { m } from "motion/react";
import { useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import { useTranslation } from "react-i18next";
import {
  DECORATION_ANIMATIONS,
  decorationAnimationById,
  decorationById,
  isAnimatedAsset,
} from "../../../data/decorations.tsx";
import type { Decoration } from "../../../services/repos/weeksRepo.ts";
import { useDecorStore } from "../../../state/decorStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { DecorationArt } from "./DecorationArt.tsx";
import { PhotoDecorationArt } from "./PhotoDecorationArt.tsx";

interface DecorationItemProps {
  decoration: Decoration;
  editMode: boolean;
  selected: boolean;
  layerRef: RefObject<HTMLDivElement | null>;
}

interface Transform {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface DragState {
  startX: number;
  startY: number;
  rectW: number;
  rectH: number;
  originX: number;
  originY: number;
  pointerId: number;
  moved: boolean;
}

const SCALE_MIN = 0.4;
const SCALE_MAX = 2.5;

const PHOTO_W = 116;
const PHOTO_H = 132;

const clampPct = (value: number): number => Math.min(94, Math.max(6, value));

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M5 7h14M10 7V5h4v2M6 7l1 12h10l1-12" />
  </svg>
);

export const DecorationItem = ({
  decoration,
  editMode,
  selected,
  layerRef,
}: DecorationItemProps) => {
  const { t } = useTranslation("decor");
  const reduced = useReducedMotionPref();
  const [draft, setDraft] = useState<Transform | null>(null);
  const [moving, setMoving] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  const persistKey = `${decoration.x},${decoration.y},${decoration.rotation},${decoration.scale}`;
  const [seenKey, setSeenKey] = useState(persistKey);
  if (seenKey !== persistKey) {
    setSeenKey(persistKey);
    setDraft(null);
  }

  const isPhoto = decoration.kind === "photo";
  const asset = decorationById(decoration.asset);
  if (!isPhoto && !asset) return null;

  const itemW = isPhoto ? PHOTO_W : (asset?.w ?? PHOTO_W);
  const itemH = isPhoto ? PHOTO_H : (asset?.h ?? PHOTO_H);
  const itemKind = isPhoto ? "photo" : (asset?.kind ?? "sticker");

  const base: Transform = {
    x: decoration.x,
    y: decoration.y,
    rotation: decoration.rotation,
    scale: decoration.scale,
  };
  const view = draft ?? base;

  const apply = (next: Transform) => setDraft(next);

  const commit = (patch: Partial<Transform>) => {
    useWeekStore.getState().updateDecoration(decoration.id, patch);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editMode) return;
    event.stopPropagation();
    useDecorStore.getState().select(decoration.id);
    const layer = layerRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      rectW: rect.width,
      rectH: rect.height,
      originX: view.x,
      originY: view.y,
      pointerId: event.pointerId,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > 3) {
      drag.moved = true;
      setMoving(true);
    }
    if (!drag.moved || drag.rectW === 0 || drag.rectH === 0) return;
    apply({
      ...view,
      x: clampPct(drag.originX + (dx / drag.rectW) * 100),
      y: clampPct(drag.originY + (dy / drag.rectH) * 100),
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.moved) {
      setMoving(false);
      if (drag.rectW === 0 || drag.rectH === 0) return;
      const x = clampPct(drag.originX + ((event.clientX - drag.startX) / drag.rectW) * 100);
      const y = clampPct(drag.originY + ((event.clientY - drag.startY) / drag.rectH) * 100);
      commit({ x, y });
    }
  };

  const nudge = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!editMode) return;
    const step = event.shiftKey ? 3 : 1;
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = -step;
    else if (event.key === "ArrowRight") dx = step;
    else if (event.key === "ArrowUp") dy = -step;
    else if (event.key === "ArrowDown") dy = step;
    else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      useWeekStore.getState().removeDecoration(decoration.id);
      return;
    } else {
      return;
    }
    event.preventDefault();
    const next = {
      ...view,
      x: clampPct(view.x + dx),
      y: clampPct(view.y + dy),
    };
    apply(next);
    commit({ x: next.x, y: next.y });
  };

  const animatable = !isPhoto && asset ? isAnimatedAsset(asset) : false;
  const animation = decorationAnimationById(
    animatable ? decoration.animation : "none",
  );
  const playing =
    !reduced &&
    Boolean(animation?.animate) &&
    (!editMode || (selected && !moving));
  const phase =
    (decoration.id.charCodeAt(0) + decoration.id.charCodeAt(1)) % 5;
  const art = isPhoto ? (
    <PhotoDecorationArt src={decoration.thumbSrc ?? decoration.src} name={null} />
  ) : (
    <DecorationArt assetId={decoration.asset} />
  );

  return (
    <Popover
      opened={editMode && selected && !moving}
      position="top"
      offset={10}
      withinPortal
      trapFocus={false}
      closeOnClickOutside={false}
      radius="md"
      shadow="md"
      middlewares={{ flip: true, shift: true }}
    >
      <Popover.Target>
        <div
          role={editMode ? "button" : undefined}
          aria-label={
            editMode ? t("itemLabel", { kind: t(`kind.${itemKind}`) }) : undefined
          }
          aria-hidden={editMode ? undefined : true}
          tabIndex={editMode ? 0 : -1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onFocus={() => useDecorStore.getState().select(decoration.id)}
          onKeyDown={nudge}
          style={{
            position: "absolute",
            left: `${view.x}%`,
            top: `${view.y}%`,
            width: itemW * view.scale,
            height: itemH * view.scale,
            transform: "translate(-50%, -50%)",
            pointerEvents: editMode ? "auto" : "none",
            touchAction: editMode ? "none" : undefined,
            cursor: editMode ? (moving ? "grabbing" : "grab") : "default",
            zIndex: selected ? 3 : 1,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: `rotate(${view.rotation}deg)`,
              transformOrigin: "center",
              outline:
                editMode && selected ? "2px dashed var(--sw-accent)" : "none",
              outlineOffset: 4,
              borderRadius: 6,
            }}
          >
            {playing && animation?.animate ? (
              <m.div
                animate={animation.animate}
                transition={
                  animation.transition
                    ? { ...animation.transition, delay: phase * 0.2 }
                    : undefined
                }
                style={{ width: "100%", height: "100%" }}
              >
                {art}
              </m.div>
            ) : (
              art
            )}
          </div>
        </div>
      </Popover.Target>
      <Popover.Dropdown
        p="sm"
        style={{ backgroundColor: "var(--sw-paper)", borderColor: "var(--sw-line)" }}
      >
        <Stack gap={8} w={200}>
          <Stack gap={2}>
            <Text fz="xs" fw={600} c="var(--sw-ink-2)">
              {t("rotate")}
            </Text>
            <Slider
              value={view.rotation}
              min={-180}
              max={180}
              step={1}
              label={null}
              aria-label={t("rotate")}
              color="var(--sw-accent)"
              onChange={(value) => apply({ ...view, rotation: value })}
              onChangeEnd={(value) => {
                apply({ ...view, rotation: value });
                commit({ rotation: value });
              }}
            />
          </Stack>
          <Stack gap={2}>
            <Text fz="xs" fw={600} c="var(--sw-ink-2)">
              {t("scale")}
            </Text>
            <Slider
              value={view.scale}
              min={SCALE_MIN}
              max={SCALE_MAX}
              step={0.05}
              label={null}
              aria-label={t("scale")}
              color="var(--sw-accent)"
              onChange={(value) => apply({ ...view, scale: value })}
              onChangeEnd={(value) => {
                apply({ ...view, scale: value });
                commit({ scale: value });
              }}
            />
          </Stack>
          {animatable && (
            <Stack gap={2}>
              <Text fz="xs" fw={600} c="var(--sw-ink-2)">
                {t("animation")}
              </Text>
              <Select
                data={DECORATION_ANIMATIONS.map((option) => ({
                  value: option.id,
                  label: t(`anim.${option.id}`),
                }))}
                value={decoration.animation}
                onChange={(value) => {
                  if (value) {
                    useWeekStore
                      .getState()
                      .updateDecoration(decoration.id, { animation: value });
                  }
                }}
                allowDeselect={false}
                comboboxProps={{ withinPortal: true }}
                size="xs"
              />
            </Stack>
          )}
          <ActionIcon
            variant="subtle"
            color="var(--sw-danger)"
            aria-label={t("remove")}
            onClick={() => useWeekStore.getState().removeDecoration(decoration.id)}
            style={{ alignSelf: "flex-end" }}
          >
            <TrashIcon />
          </ActionIcon>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
