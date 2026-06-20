import { Box, Button, FocusTrap, Group, Paper, Stack, Text } from "@mantine/core";
import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { TourStep } from "../../../data/tourSteps.ts";
import { computeCalloutPosition } from "./positioning.ts";
import type { Rect } from "./positioning.ts";

interface TourBubbleProps {
  step: TourStep;
  index: number;
  total: number;
  rect: Rect | null;
  reduced: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

const CARD_WIDTH = 300;
const Z = 9001;

const ProgressDots = ({
  index,
  total,
  reduced,
}: {
  index: number;
  total: number;
  reduced: boolean;
}) => (
  <Group gap={5} justify="center">
    {Array.from({ length: total }, (_, dot) => (
      <span
        key={dot}
        style={{
          width: dot === index ? 18 : 7,
          height: 7,
          borderRadius: 999,
          backgroundColor:
            dot === index ? "var(--sw-accent)" : "var(--sw-line)",
          transition: reduced
            ? "none"
            : "width 160ms ease, background-color 160ms ease",
        }}
      />
    ))}
  </Group>
);

export const TourBubble = ({
  step,
  index,
  total,
  rect,
  reduced,
  onBack,
  onNext,
  onSkip,
}: TourBubbleProps) => {
  const { t } = useTranslation("tour");
  const cardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: CARD_WIDTH, height: 180 });

  useLayoutEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    if (box.height !== size.height || box.width !== size.width) {
      setSize({ width: box.width, height: box.height });
    }
  }, [size.width, size.height]);

  const position = computeCalloutPosition(
    rect,
    size,
    step.placement,
    { width: window.innerWidth, height: window.innerHeight },
  );

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const wrapperStyle: CSSProperties = {
    position: "fixed",
    top: position.top,
    left: position.left,
    width: CARD_WIDTH,
    maxWidth: "calc(100vw - 24px)",
    zIndex: Z,
    transition: reduced ? "none" : "top 180ms ease, left 180ms ease",
  };

  return (
    <Box
      ref={cardRef}
      style={wrapperStyle}
      role="dialog"
      aria-modal="true"
      aria-label={t("aria")}
    >
      <FocusTrap active>
        <Paper
          p="md"
          radius="lg"
          shadow="md"
          tabIndex={-1}
          style={{
            backgroundColor: "var(--sw-card)",
            border: "1px solid var(--sw-line)",
          }}
        >
          <Stack gap="sm">
            <Text
              ff="var(--sw-font-hand)"
              fz={26}
              fw={600}
              c="var(--sw-ink)"
              lh={1.1}
            >
              {t(`steps.${step.id}.title`)}
            </Text>
            <Text fz="sm" c="var(--sw-ink-2)" lh={1.45}>
              {t(`steps.${step.id}.body`)}
            </Text>
            <ProgressDots index={index} total={total} reduced={reduced} />
            <Group justify="space-between" wrap="nowrap" mt={2}>
              <Button
                variant="subtle"
                size="compact-sm"
                c="var(--sw-ink-3)"
                onClick={onSkip}
              >
                {t("skip")}
              </Button>
              <Group gap="xs" wrap="nowrap">
                {!isFirst && (
                  <Button
                    variant="default"
                    size="compact-sm"
                    onClick={onBack}
                  >
                    {t("back")}
                  </Button>
                )}
                <Button
                  size="compact-sm"
                  color="var(--sw-accent)"
                  data-autofocus
                  onClick={onNext}
                  styles={{
                    root: {
                      backgroundColor: "var(--sw-accent)",
                      color: "var(--sw-accent-ink)",
                    },
                  }}
                >
                  {isLast ? t("done") : t("next")}
                </Button>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </FocusTrap>
    </Box>
  );
};
