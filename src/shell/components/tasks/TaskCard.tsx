import {
  ActionIcon,
  Box,
  Menu,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../services/repos/tasksRepo.ts";

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onMove?: () => void;
  isOverlay?: boolean;
}

const MAX_TITLE = 500;

const KebabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

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
  transition: "background-color 120ms ease",
});

export const TaskCard = ({
  task,
  onToggle,
  onRename,
  onDelete,
  onMove,
  isOverlay = false,
}: TaskCardProps) => {
  const { t } = useTranslation("tasks");
  const { hovered, ref } = useHover();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const done = task.status === "done";

  const startEdit = () => {
    setDraft(task.title);
    setEditing(true);
  };
  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0 && trimmed !== task.title) onRename(trimmed);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(task.title);
    setEditing(false);
  };
  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  };

  return (
    <Box ref={isOverlay ? undefined : ref} style={cardStyle(done, hovered, isOverlay)}>
      <UnstyledButton
        onClick={onToggle}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        aria-label={done ? t("reopen") : t("done")}
        style={{
          marginTop: 2,
          width: 20,
          height: 20,
          flex: "0 0 auto",
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
      {editing ? (
        <TextInput
          autoFocus
          variant="unstyled"
          value={draft}
          maxLength={MAX_TITLE}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={handleKey}
          onPointerDown={(event) => event.stopPropagation()}
          onBlur={commit}
          style={{ flex: 1 }}
          styles={{
            input: {
              fontFamily: "var(--sw-font-body)",
              color: "var(--sw-ink)",
              minHeight: "unset",
              height: "auto",
              lineHeight: 1.4,
              padding: 0,
            },
          }}
        />
      ) : (
        <Text
          onClick={isOverlay ? undefined : startEdit}
          style={{
            flex: 1,
            cursor: isOverlay ? "default" : "text",
            color: done ? "var(--sw-ink-3)" : "var(--sw-ink)",
            textDecoration: done ? "line-through" : "none",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {task.title}
        </Text>
      )}
      {!isOverlay && (
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="var(--sw-ink-3)"
              size="sm"
              aria-label={t("edit")}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              style={{
                flex: "0 0 auto",
                opacity: hovered ? 1 : 0.35,
                transition: "opacity 120ms ease",
              }}
            >
              <KebabIcon />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={startEdit}>{t("edit")}</Menu.Item>
            {onMove && <Menu.Item onClick={onMove}>{t("move")}</Menu.Item>}
            <Menu.Item
              style={{ color: "var(--sw-danger)" }}
              onClick={onDelete}
            >
              {t("delete")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </Box>
  );
};
