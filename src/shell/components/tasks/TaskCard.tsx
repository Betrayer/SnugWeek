import { Box, Text, UnstyledButton } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { m, useAnimationControls } from "motion/react";
import { useEffect, useRef } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { tagSwatchValue } from "../../../data/tagColors.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { formatTime } from "../../../services/time.ts";
import { useTagsStore } from "../../../state/tagsStore.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { PaperclipGlyph } from "../attachments/icons.tsx";
import { CardSubtasks } from "./CardSubtasks.tsx";

const MAX_CARD_TAGS = 4;

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
  flexDirection: "column",
  gap: 2,
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

const RepeatGlyph = () => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M17 2.1 21 6l-4 3.9" />
    <path d="M3 12.5V11a5 5 0 0 1 5-5h13" />
    <path d="M7 21.9 3 18l4-3.9" />
    <path d="M21 11.5V13a5 5 0 0 1-5 5H3" />
  </svg>
);

const RepeatChip = ({ label }: { label: string }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      alignSelf: "flex-start",
      fontSize: 10,
      fontWeight: 700,
      lineHeight: 1.5,
      color: "var(--sw-ink-3)",
      backgroundColor: "color-mix(in srgb, var(--sw-ink-3) 10%, transparent)",
      padding: "0 6px",
      borderRadius: 999,
      whiteSpace: "nowrap",
    }}
  >
    <RepeatGlyph />
    {label}
  </span>
);

const AttachmentChip = ({ count }: { count: number }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      alignSelf: "flex-start",
      fontSize: 10,
      fontWeight: 700,
      lineHeight: 1.5,
      color: "var(--sw-ink-3)",
      backgroundColor: "color-mix(in srgb, var(--sw-ink-3) 10%, transparent)",
      padding: "0 6px",
      borderRadius: 999,
      whiteSpace: "nowrap",
    }}
  >
    <PaperclipGlyph size={9} />
    {count}
  </span>
);

const BellGlyph = () => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

const TimeChip = ({
  time,
  hasReminder,
  done,
}: {
  time: string;
  hasReminder: boolean;
  done: boolean;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      alignSelf: "flex-start",
      fontSize: 10,
      fontWeight: 700,
      lineHeight: 1.6,
      color: done ? "var(--sw-ink-3)" : "var(--sw-accent-2)",
      backgroundColor: done
        ? "color-mix(in srgb, var(--sw-ink-3) 10%, transparent)"
        : "color-mix(in srgb, var(--sw-accent-2) 14%, transparent)",
      padding: "0 6px",
      borderRadius: 999,
      whiteSpace: "nowrap",
    }}
  >
    {formatTime(time)}
    {hasReminder && <BellGlyph />}
  </span>
);

const CardTags = ({ task }: { task: Task }) => {
  const tags = useTagsStore((state) => state.tags);
  const taskTags = task.tagIds
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

  if (taskTags.length === 0) return null;

  const visible = taskTags.slice(0, MAX_CARD_TAGS);
  const overflow = taskTags.length - visible.length;

  return (
    <span
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
        marginTop: 1,
      }}
    >
      {visible.map((tag) => (
        <span
          key={tag.id}
          role="img"
          aria-label={tag.name}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            maxWidth: "100%",
            height: 18,
            paddingInline: 7,
            borderRadius: 999,
            backgroundColor: `color-mix(in srgb, ${tagSwatchValue(tag.color)} 16%, transparent)`,
            border: `1px solid color-mix(in srgb, ${tagSwatchValue(tag.color)} 42%, transparent)`,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: tagSwatchValue(tag.color),
              flex: "0 0 auto",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.5,
              color: "var(--sw-ink-2)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tag.name}
          </span>
        </span>
      ))}
      {overflow > 0 && (
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--sw-ink-3)" }}>
          +{overflow}
        </span>
      )}
    </span>
  );
};

export const TaskCard = ({
  task,
  onToggle,
  onOpen,
  isOverlay = false,
}: TaskCardProps) => {
  const { t } = useTranslation(["tasks", "routines"]);
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
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
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
            gap: 3,
            cursor: isOverlay ? "default" : "pointer",
            textAlign: "start",
          }}
        >
          {task.time !== null && (
            <TimeChip
              time={task.time}
              hasReminder={task.remindOffsetMin !== null}
              done={done}
            />
          )}
          <Text
            component="span"
            style={{
              width: "100%",
              color: done ? "var(--sw-ink-3)" : "var(--sw-ink)",
              textDecorationLine: "line-through",
              textDecorationColor: done ? "var(--sw-ink-3)" : "transparent",
              lineHeight: 1.4,
              wordBreak: "break-word",
              transition: "color 150ms ease, text-decoration-color 250ms ease",
            }}
          >
            {task.title}
          </Text>
          <CardTags task={task} />
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
              {t("tasks:carriedFrom", { week: task.carriedFrom.slice(5) })}
            </span>
          )}
          {task.routineId !== null && (
            <RepeatChip label={t("routines:repeats")} />
          )}
          {task.attachmentCount > 0 && (
            <AttachmentChip count={task.attachmentCount} />
          )}
        </UnstyledButton>
      </div>
      {!isOverlay && task.subtaskCount > 0 && (
        <CardSubtasks taskId={task.id} onOpen={onOpen} />
      )}
    </Box>
  );
};
