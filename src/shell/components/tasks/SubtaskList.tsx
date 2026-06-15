import { ActionIcon, Box, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Subtask } from "../../../services/repos/subtasksRepo.ts";
import { useAuthStore } from "../../../state/authStore.ts";
import {
  MAX_SUBTASK_TITLE,
  MAX_SUBTASKS,
  useSubtasksStore,
} from "../../../state/subtasksStore.ts";
import { SortableItem } from "../settings/SortableItem.tsx";
import { SortableList } from "../settings/SortableList.tsx";

const CheckMark = ({ done }: { done: boolean }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--sw-accent-ink)"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path
      d="M5 12l4.5 4.5L19 7"
      pathLength={1}
      style={{
        strokeDasharray: 1,
        strokeDashoffset: done ? 0 : 1,
        transition: "stroke-dashoffset 200ms ease",
      }}
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
);

const SubtaskRow = ({ item, taskId }: { item: Subtask; taskId: string }) => {
  const { t } = useTranslation("tasks");
  const [draft, setDraft] = useState(item.title);
  const [syncedTitle, setSyncedTitle] = useState(item.title);

  if (item.title !== syncedTitle) {
    setSyncedTitle(item.title);
    setDraft(item.title);
  }

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0 && trimmed !== item.title) {
      useSubtasksStore.getState().rename(taskId, item.id, trimmed);
    } else if (trimmed.length === 0) {
      setDraft(item.title);
    }
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDraft(item.title);
      event.currentTarget.blur();
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flex: 1,
        minWidth: 0,
      }}
    >
      <UnstyledButton
        onClick={() => useSubtasksStore.getState().toggle(taskId, item.id)}
        aria-pressed={item.done}
        aria-label={item.done ? t("subtasks.reopen") : t("subtasks.check")}
        style={{
          flex: "0 0 auto",
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `2px solid ${item.done ? "var(--sw-done)" : "var(--sw-line)"}`,
          backgroundColor: item.done ? "var(--sw-done)" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 150ms ease, border-color 150ms ease",
        }}
      >
        <CheckMark done={item.done} />
      </UnstyledButton>
      <TextInput
        value={draft}
        maxLength={MAX_SUBTASK_TITLE}
        aria-label={t("subtasks.itemLabel")}
        variant="unstyled"
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        style={{ flex: 1, minWidth: 0 }}
        styles={{
          input: {
            color: item.done ? "var(--sw-ink-3)" : "var(--sw-ink)",
            textDecoration: item.done ? "line-through" : "none",
            minHeight: 28,
            height: 28,
          },
        }}
      />
      <ActionIcon
        variant="subtle"
        color="var(--sw-ink-3)"
        size="sm"
        aria-label={t("subtasks.remove")}
        onClick={() => useSubtasksStore.getState().remove(taskId, item.id)}
        style={{ flex: "0 0 auto" }}
      >
        <TrashIcon />
      </ActionIcon>
    </Box>
  );
};

const EMPTY: Subtask[] = [];

export const SubtaskList = ({ taskId }: { taskId: string }) => {
  const { t } = useTranslation("tasks");
  const uid = useAuthStore((state) => state.uid);
  const list = useSubtasksStore((state) => state.itemsByTask[taskId] ?? EMPTY);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!uid) return;
    useSubtasksStore.getState().retain(uid, taskId);
    return () => useSubtasksStore.getState().release(taskId);
  }, [uid, taskId]);

  const atCap = list.length >= MAX_SUBTASKS;

  const submit = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || atCap) return;
    useSubtasksStore.getState().add(taskId, trimmed);
    setDraft("");
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <Stack gap={6}>
      {list.length > 0 && (
        <SortableList
          ids={list.map((item) => item.id)}
          onReorder={(ids) => useSubtasksStore.getState().reorder(taskId, ids)}
        >
          <Stack gap={2}>
            {list.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                handleLabel={t("subtasks.reorder")}
              >
                <SubtaskRow item={item} taskId={taskId} />
              </SortableItem>
            ))}
          </Stack>
        </SortableList>
      )}

      {atCap ? (
        <Text fz="xs" c="var(--sw-ink-3)">
          {t("subtasks.cap", { max: MAX_SUBTASKS })}
        </Text>
      ) : (
        <TextInput
          value={draft}
          maxLength={MAX_SUBTASK_TITLE}
          placeholder={t("subtasks.addPlaceholder")}
          aria-label={t("subtasks.addPlaceholder")}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={handleKey}
          leftSection={<span style={{ color: "var(--sw-ink-3)", fontSize: 18 }}>+</span>}
          styles={{
            input: {
              backgroundColor: "var(--sw-card)",
              borderColor: "var(--sw-line)",
              color: "var(--sw-ink)",
              "--input-placeholder-color": "var(--sw-ink-3)",
            },
          }}
        />
      )}
    </Stack>
  );
};
