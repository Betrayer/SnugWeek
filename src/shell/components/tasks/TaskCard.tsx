import { Box, Text, UnstyledButton } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { m, useAnimationControls } from "motion/react";
import { useEffect, useRef } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onOpen?: () => void;
  isOverlay?: boolean;
}

const CheckMark = ({ done }: { done: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--sw-accent-ink)"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M5 12l4.5 4.5L19 7"
      pathLength={1}
      style={{
        strokeDasharray: 1,
        strokeDashoffset: done ? 0 : 1,
        transition: "stroke-dashoffset 220ms ease",
      }}
    />
  </svg>
);

const cardStyle = (
  done: boolean,
  hovered: boolean,
  isOverlay: boolean,
): CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: "6px 8px",
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: isOverlay
    ? "var(--sw-card)"
    : done
      ? "color-mix(in srgb, var(--sw-done) 12%, transparent)"
      : hovered
        ? "var(--sw-paper-2)"
        : "transparent",
  boxShadow: isOverlay ? "var(--sw-shadow)" : "none",
  transform: hovered && !isOverlay ? "translateY(-1px)" : "none",
  transition: "background-color 120ms ease, transform 120ms ease",
});

export const TaskCard = ({
  task,
  onToggle,
  onOpen,
  isOverlay = false,
}: TaskCardProps) => {
  const { t } = useTranslation("tasks");
  const { hovered, ref } = useHover();
  const reduced = useReducedMotionPref();
  const checkControls = useAnimationControls();
  const wasDone = useRef(task.status === "done");
  const done = task.status === "done";

  useEffect(() => {
    if (done && !wasDone.current && !reduced) {
      void checkControls.start({
        scale: [1, 1.28, 1],
        transition: { duration: 0.3, ease: "easeOut" },
      });
    }
    wasDone.current = done;
  }, [done, reduced, checkControls]);

  return (
    <Box ref={isOverlay ? undefined : ref} style={cardStyle(done, hovered, isOverlay)}>
      <m.div
        animate={checkControls}
        style={{ marginTop: 2, flex: "0 0 auto", display: "inline-flex" }}
      >
        <UnstyledButton
          onClick={onToggle}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          aria-label={done ? t("reopen") : t("done")}
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: `2px solid ${done ? "var(--sw-done)" : "var(--sw-line)"}`,
            backgroundColor: done ? "var(--sw-done)" : "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 150ms ease, border-color 150ms ease",
          }}
        >
          <CheckMark done={done} />
        </UnstyledButton>
      </m.div>
      <UnstyledButton
        onClick={isOverlay ? undefined : onOpen}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) =>
          event.stopPropagation()
        }
        component={isOverlay ? "div" : "button"}
        aria-label={isOverlay ? undefined : t("openDetail", { title: task.title })}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
          cursor: isOverlay ? "default" : "pointer",
          textAlign: "start",
        }}
      >
        <Text
          style={{
            color: done ? "var(--sw-ink-3)" : "var(--sw-ink)",
            textDecoration: "line-through",
            textDecorationColor: done ? "var(--sw-ink-3)" : "transparent",
            lineHeight: 1.4,
            wordBreak: "break-word",
            transition: "color 150ms ease, text-decoration-color 250ms ease",
          }}
        >
          {task.title}
        </Text>
        {task.carriedFrom && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1.5,
              color: "var(--sw-accent-2)",
              backgroundColor:
                "color-mix(in srgb, var(--sw-accent-2) 12%, transparent)",
              padding: "0 6px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {t("carriedFrom", { week: task.carriedFrom.slice(5) })}
          </span>
        )}
      </UnstyledButton>
    </Box>
  );
};
