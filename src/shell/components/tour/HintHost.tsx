import { Button, Paper, Stack, Text } from "@mantine/core";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useTourStore } from "../../../state/tourStore.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { HINT_IDS, isHintSeen, markHintSeen } from "./hintFlags.ts";
import { computeCalloutPosition } from "./positioning.ts";
import { firstVisibleMatch } from "./tourTarget.ts";
import { useTrackedRect } from "./useTrackedRect.ts";

const CARD_WIDTH = 264;
const Z = 500;

const presentHints = (): Set<string> => {
  const present = new Set<string>();
  for (const id of HINT_IDS) {
    if (firstVisibleMatch(`[data-hint="${id}"]`)) present.add(id);
  }
  return present;
};

export const HintHost = () => {
  const { t } = useTranslation("tour");
  const reduced = useReducedMotionPref();
  const tourRunning = useTourStore((state) => state.running);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const presentRef = useRef<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: CARD_WIDTH, height: 96 });

  const selector = activeId ? `[data-hint="${activeId}"]` : null;
  const { rect, missing } = useTrackedRect(selector, activeId !== null);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (tourRunning) return;
    let frame = 0;
    const scan = () => {
      if (useTourStore.getState().running) return;
      const present = presentHints();
      const previous = presentRef.current;
      presentRef.current = present;
      if (activeRef.current) return;
      for (const id of HINT_IDS) {
        if (present.has(id) && !previous.has(id) && !isHintSeen(id)) {
          setActiveId(id);
          return;
        }
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [tourRunning]);

  useEffect(() => {
    if (!activeId || !missing) return;
    const reset = requestAnimationFrame(() => setActiveId(null));
    return () => cancelAnimationFrame(reset);
  }, [activeId, missing]);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      markHintSeen(activeId);
      setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  useLayoutEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    if (box.height !== size.height || box.width !== size.width) {
      setSize({ width: box.width, height: box.height });
    }
  }, [size.width, size.height]);

  if (!activeId || !rect || tourRunning) return null;

  const dismiss = () => {
    markHintSeen(activeId);
    setActiveId(null);
  };

  const position = computeCalloutPosition(rect, size, "bottom", {
    width: window.innerWidth,
    height: window.innerHeight,
  });

  return createPortal(
    <Paper
      key={activeId}
      ref={cardRef}
      role="status"
      p="sm"
      radius="lg"
      shadow="md"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: CARD_WIDTH,
        maxWidth: "calc(100vw - 24px)",
        zIndex: Z,
        backgroundColor: "var(--sw-card)",
        border: "1px solid var(--sw-accent)",
        transition: reduced ? "none" : "top 160ms ease, left 160ms ease",
      }}
    >
      <Stack gap="xs">
        <Text fz="sm" c="var(--sw-ink-2)" lh={1.4}>
          {t(`hints.${activeId}`)}
        </Text>
        <Button
          size="compact-xs"
          variant="light"
          color="var(--sw-accent)"
          onClick={dismiss}
          style={{ alignSelf: "flex-end" }}
        >
          {t("hintDismiss")}
        </Button>
      </Stack>
    </Paper>,
    document.body,
  );
};
