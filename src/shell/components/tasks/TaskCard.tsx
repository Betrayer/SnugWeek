import { ActionIcon, Box, Button, Group, Text, TextInput, UnstyledButton } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { tagSwatchValue } from "../../../data/tagColors.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import type { TaskDoneStyle } from "../../../services/repos/profileRepo.ts";
import { formatTime } from "../../../services/time.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useTagsStore } from "../../../state/tagsStore.ts";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { inputFieldStyles } from "../../styles/fieldStyles.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import {
  DrawnCheckGlyph,
  ExpandGlyph,
  PaperclipGlyph,
  PencilGlyph,
  TrashGlyph,
} from "../icons/glyphs.tsx";
import { Pill } from "../common/Pill.tsx";
import { CardSubtasks } from "./CardSubtasks.tsx";

const MAX_CARD_TAGS = 4;
const MAX_TITLE = 500;

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onOpen?: () => void;
  onRename?: (title: string) => void;
  onDelete?: () => void;
  isOverlay?: boolean;
}

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

const doneTextColor = (style: TaskDoneStyle, done: boolean): string => {
  if (!done) return "var(--sw-ink)";
  const dim = style === "dim" || style === "dimStrike";
  return dim ? "var(--sw-ink-3)" : "var(--sw-ink)";
};

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

const TaskBody = ({
  task,
  style,
  titleClassName,
}: {
  task: Task;
  style: CSSProperties;
  titleClassName?: string;
}) => {
  const { t } = useTranslation(["tasks", "routines"]);
  const done = task.status === "done";
  return (
    <>
      {task.time !== null && (
        <Pill tone={done ? "muted" : "accent-2"}>
          {formatTime(task.time)}
          {task.remindOffsetMin !== null && <BellGlyph />}
        </Pill>
      )}
      <Text
        component="span"
        style={{
          width: "100%",
          lineHeight: 1.4,
          wordBreak: "break-word",
          fontFamily: "var(--sw-font-tasks)",
          transition: "color 150ms ease",
          ...style,
        }}
      >
        {task.emoji && (
          <span style={{ marginInlineEnd: 4 }}>{task.emoji}</span>
        )}
        {titleClassName ? (
          <span className={titleClassName}>{task.title}</span>
        ) : (
          task.title
        )}
      </Text>
      <CardTags task={task} />
      {task.carriedFrom && (
        <Pill tone="accent-2">
          {t("tasks:carriedFrom", { week: task.carriedFrom.slice(5) })}
        </Pill>
      )}
      {task.routineId !== null && (
        <Pill tone="muted" icon={<RepeatGlyph />}>
          {t("routines:repeats")}
        </Pill>
      )}
      {task.attachmentCount > 0 && (
        <Pill tone="muted" icon={<PaperclipGlyph size={9} />}>
          {task.attachmentCount}
        </Pill>
      )}
    </>
  );
};

export const TaskCard = ({
  task,
  onToggle,
  onOpen,
  onRename,
  onDelete,
  isOverlay = false,
}: TaskCardProps) => {
  const { t } = useTranslation(["tasks", "common"]);
  const { hovered, ref } = useHover();
  const isMobile = useIsMobile();
  const taskDoneStyle = useProfileStore((state) => state.taskDoneStyle);
  const taskStrikeStyle = useProfileStore((state) => state.taskStrikeStyle);
  const showTaskCheckbox = useProfileStore((state) => state.showTaskCheckbox);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [confirming, setConfirming] = useState(false);
  const [focused, setFocused] = useState(false);
  const done = task.status === "done";

  const titleStyle: CSSProperties = { color: doneTextColor(taskDoneStyle, done) };
  const struck =
    done && (taskDoneStyle === "strike" || taskDoneStyle === "dimStrike");
  const titleClassName = struck
    ? `sw-strike sw-strike-${taskStrikeStyle}`
    : undefined;
  const contentOpacity = done && taskDoneStyle === "fade" ? 0.5 : 1;

  if (isOverlay) {
    return (
      <Box style={cardStyle(done, false, true)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 3,
            opacity: contentOpacity,
          }}
        >
          <TaskBody task={task} style={titleStyle} titleClassName={titleClassName} />
        </div>
      </Box>
    );
  }

  const startEdit = () => {
    setEditValue(task.title);
    setEditing(true);
  };

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed.length > 0 && trimmed !== task.title) onRename?.(trimmed);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(task.title);
    setEditing(false);
  };

  const editKey = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  const stopForControl = {
    onPointerDown: (event: { stopPropagation: () => void }) =>
      event.stopPropagation(),
  };

  const showActions = !editing && (isMobile || hovered || focused);

  const actions = (
    <Group
      gap={2}
      wrap="nowrap"
      style={
        isMobile
          ? { flex: "0 0 auto", marginTop: 1 }
          : {
              position: "absolute",
              top: 4,
              insetInlineEnd: 4,
              backgroundColor: "var(--sw-card)",
              borderRadius: "var(--mantine-radius-sm)",
              boxShadow: "var(--sw-shadow)",
              opacity: showActions ? 1 : 0,
              pointerEvents: showActions ? "auto" : "none",
              transition: "opacity 120ms ease",
            }
      }
    >
      {onRename && (
        <ActionIcon
          variant="subtle"
          color="var(--sw-ink-3)"
          size={isMobile ? 24 : 26}
          aria-label={t("tasks:edit")}
          onClick={startEdit}
          {...stopForControl}
        >
          <PencilGlyph size={14} />
        </ActionIcon>
      )}
      {onOpen && !showTaskCheckbox && (
        <ActionIcon
          variant="subtle"
          color="var(--sw-ink-3)"
          size={isMobile ? 24 : 26}
          aria-label={t("tasks:openDetail", { title: task.title })}
          onClick={onOpen}
          {...stopForControl}
        >
          <ExpandGlyph size={14} />
        </ActionIcon>
      )}
      {onDelete && (
        <ActionIcon
          variant="subtle"
          color="var(--sw-danger)"
          size={isMobile ? 24 : 26}
          aria-label={t("tasks:delete")}
          onClick={() => setConfirming(true)}
          {...stopForControl}
        >
          <TrashGlyph size={14} />
        </ActionIcon>
      )}
    </Group>
  );

  return (
    <Box
      ref={ref}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
      style={{ ...cardStyle(done, hovered, false), position: "relative" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        {showTaskCheckbox && !editing && (
          <UnstyledButton
            onClick={onToggle}
            onKeyDown={(event: KeyboardEvent<HTMLElement>) =>
              event.stopPropagation()
            }
            aria-pressed={done}
            aria-label={done ? t("tasks:reopen") : t("tasks:done")}
            style={{
              flex: "0 0 auto",
              width: 20,
              height: 20,
              marginTop: 1,
              borderRadius: "50%",
              border: `2px solid ${done ? "var(--sw-done)" : "var(--sw-line)"}`,
              backgroundColor: done ? "var(--sw-done)" : "transparent",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition:
                "background-color 150ms ease, border-color 150ms ease",
            }}
          >
            <DrawnCheckGlyph size={11} done={done} />
          </UnstyledButton>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <TextInput
              autoFocus
              size="xs"
              value={editValue}
              maxLength={MAX_TITLE}
              aria-label={t("tasks:edit")}
              onChange={(event) => setEditValue(event.currentTarget.value)}
              onKeyDown={editKey}
              onBlur={commitEdit}
              styles={{
                input: {
                  ...inputFieldStyles.input,
                  fontFamily: "var(--sw-font-tasks)",
                },
              }}
              {...stopForControl}
            />
          ) : (
            <UnstyledButton
              onClick={showTaskCheckbox ? (onOpen ?? onToggle) : onToggle}
              onKeyDown={(event: KeyboardEvent<HTMLElement>) =>
                event.stopPropagation()
              }
              aria-pressed={showTaskCheckbox ? undefined : done}
              aria-label={
                showTaskCheckbox
                  ? t("tasks:openDetail", { title: task.title })
                  : task.title
              }
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 3,
                cursor: "pointer",
                textAlign: "start",
                opacity: contentOpacity,
                transition: "opacity 200ms ease",
              }}
            >
              <TaskBody
                task={task}
                style={titleStyle}
                titleClassName={titleClassName}
              />
            </UnstyledButton>
          )}
        </div>
        {isMobile && showActions && actions}
      </div>
      {!isMobile && actions}
      {task.subtaskCount > 0 && (
        <CardSubtasks taskId={task.id} onOpen={onOpen} />
      )}
      <ResponsiveDialog
        opened={confirming}
        onClose={() => setConfirming(false)}
        title={t("tasks:detail.deleteTitle")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Text c="var(--sw-ink-2)">{t("tasks:detail.deleteWarning")}</Text>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              c="var(--sw-ink-2)"
              onClick={() => setConfirming(false)}
            >
              {t("common:cancel")}
            </Button>
            <Button
              color="var(--sw-danger)"
              onClick={() => {
                setConfirming(false);
                onDelete?.();
              }}
            >
              {t("tasks:delete")}
            </Button>
          </Group>
        </div>
      </ResponsiveDialog>
    </Box>
  );
};
