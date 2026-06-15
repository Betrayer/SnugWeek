import {
  Box,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { isBuiltinList } from "../../../services/repos/listsRepo.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { weekDays } from "../../../services/time.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { ActionMenu } from "../common/ActionMenu.tsx";
import { BottomSheet } from "../common/BottomSheet.tsx";
import { ComingSoon } from "../common/ComingSoon.tsx";

const MAX_TITLE = 500;

const ownerOf = (task: Task) =>
  task.bucket === "day" ? useWeekStore.getState() : useListsStore.getState();

const DoneToggle = ({ task }: { task: Task }) => {
  const { t } = useTranslation("tasks");
  const done = task.status === "done";
  return (
    <UnstyledButton
      onClick={() => ownerOf(task).toggleDone(task)}
      aria-pressed={done}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--sw-ink-2)",
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `2px solid ${done ? "var(--sw-done)" : "var(--sw-line)"}`,
          backgroundColor: done ? "var(--sw-done)" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {done && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--sw-accent-ink)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12l4.5 4.5L19 7" />
          </svg>
        )}
      </span>
      {done ? t("completed") : t("done")}
    </UnstyledButton>
  );
};

const TaskDetailContent = ({ task }: { task: Task }) => {
  const { t } = useTranslation(["tasks", "week"]);
  const language = useSettingsStore((state) => state.language);
  const lists = useListsStore((state) => state.lists);
  const [draft, setDraft] = useState(task.title);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0 && trimmed !== task.title) {
      ownerOf(task).renameTask(task.id, trimmed);
    } else if (trimmed.length === 0) {
      setDraft(task.title);
    }
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDraft(task.title);
      event.currentTarget.blur();
    }
  };

  const locationLabel = (): string => {
    if (task.bucket === "day" && task.weekId !== null && task.day !== null) {
      const day = weekDays(task.weekId, language).find(
        (item) => item.iso === task.day,
      );
      return day ? day.label : "";
    }
    const list = lists.find((item) => item.id === task.listId);
    if (!list) return "";
    return isBuiltinList(list.id) ? t(`tasks:lists.${list.kind}`) : (list.name ?? "");
  };

  const menuActions = [
    {
      key: "move",
      label: t("tasks:move"),
      onClick: () => useUiStore.getState().openMove(task),
    },
    {
      key: "delete",
      label: t("tasks:delete"),
      danger: true,
      onClick: () => {
        ownerOf(task).removeTask(task.id);
        useUiStore.getState().closeTask();
      },
      confirm: {
        title: t("tasks:detail.deleteTitle"),
        body: t("tasks:detail.deleteWarning"),
        confirmLabel: t("tasks:delete"),
      },
    },
  ];

  const placeholders: { key: string; label: string; icon: string }[] = [
    { key: "notes", label: t("tasks:detail.notes"), icon: "📝" },
    { key: "subtasks", label: t("tasks:detail.subtasks"), icon: "☑️" },
    { key: "tags", label: t("tasks:detail.tags"), icon: "🏷️" },
    { key: "reminder", label: t("tasks:detail.reminder"), icon: "⏰" },
    { key: "attachments", label: t("tasks:detail.attachments"), icon: "📎" },
  ];

  return (
    <Stack gap="lg" pb="md">
      <Group justify="space-between" wrap="nowrap">
        <DoneToggle task={task} />
        <ActionMenu label={t("tasks:detail.actions")} actions={menuActions} />
      </Group>

      <TextInput
        label={t("tasks:detail.titleLabel")}
        value={draft}
        maxLength={MAX_TITLE}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        styles={{
          label: { color: "var(--sw-ink-2)", fontWeight: 600 },
          input: {
            backgroundColor: "var(--sw-card)",
            borderColor: "var(--sw-line)",
            color: "var(--sw-ink)",
          },
        }}
      />

      <Box>
        <Text fz="xs" fw={700} c="var(--sw-ink-3)" tt="uppercase">
          {t("tasks:detail.locationLabel")}
        </Text>
        <Text c="var(--sw-ink)">{locationLabel()}</Text>
        {task.carriedFrom && (
          <Text fz="sm" c="var(--sw-accent-2)" mt={2}>
            {t("tasks:detail.carried", { week: task.carriedFrom.slice(5) })}
          </Text>
        )}
      </Box>

      <Divider color="var(--sw-line)" />

      <Stack gap="sm">
        {placeholders.map((item) => (
          <ComingSoon
            key={item.key}
            label={item.label}
            icon={<span style={{ fontSize: 18 }}>{item.icon}</span>}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export const TaskDetail = () => {
  const { t } = useTranslation("tasks");
  const isMobile = useIsMobile();
  const openTaskId = useUiStore((state) => state.openTaskId);
  const close = useUiStore((state) => state.closeTask);
  const tasksByDay = useWeekStore((state) => state.tasksByDay);
  const tasksByList = useListsStore((state) => state.tasksByList);
  const location = useLocation();

  const task = useMemo(() => {
    if (!openTaskId) return null;
    for (const tasks of Object.values(tasksByDay)) {
      const found = tasks.find((item) => item.id === openTaskId);
      if (found) return found;
    }
    for (const tasks of Object.values(tasksByList)) {
      const found = tasks.find((item) => item.id === openTaskId);
      if (found) return found;
    }
    return null;
  }, [openTaskId, tasksByDay, tasksByList]);

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    if (openTaskId && !task) close();
  }, [openTaskId, task, close]);

  const opened = openTaskId !== null && task !== null;

  if (isMobile) {
    return (
      <BottomSheet
        opened={opened}
        onClose={close}
        title={t("detail.title")}
        size="92%"
      >
        {task && <TaskDetailContent key={task.id} task={task} />}
      </BottomSheet>
    );
  }

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="right"
      size={400}
      title={t("detail.title")}
      styles={{
        content: { backgroundColor: "var(--sw-paper)" },
        header: { backgroundColor: "var(--sw-paper)" },
        title: {
          fontFamily: "var(--sw-font-hand)",
          fontSize: 26,
          color: "var(--sw-ink-2)",
        },
      }}
    >
      {task && <TaskDetailContent key={task.id} task={task} />}
    </Drawer>
  );
};
