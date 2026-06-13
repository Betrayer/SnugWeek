import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { isBuiltinList } from "../../../services/repos/listsRepo.ts";
import type { List } from "../../../services/repos/listsRepo.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { listContainerId } from "../tasks/dndIds.ts";
import { TaskComposer } from "../tasks/TaskComposer.tsx";
import { TaskList } from "../tasks/TaskList.tsx";

interface ListSectionProps {
  list: List;
}

const EMPTY: Task[] = [];

const KebabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

export const ListSection = ({ list }: ListSectionProps) => {
  const { t } = useTranslation("tasks");
  const tasks = useListsStore((state) => state.tasksByList[list.id] ?? EMPTY);
  const [renameOpened, renameHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [nameDraft, setNameDraft] = useState("");

  const builtin = isBuiltinList(list.id);
  const name = builtin ? t(`lists.${list.kind}`) : (list.name ?? "");
  const openCount = tasks.filter((task) => task.status === "open").length;

  const openRename = () => {
    setNameDraft(name);
    renameHandlers.open();
  };
  const submitRename = () => {
    useListsStore.getState().renameList(list.id, nameDraft);
    renameHandlers.close();
  };
  const renameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submitRename();
    }
  };
  const confirmDelete = () => {
    useListsStore.getState().removeList(list.id);
    deleteHandlers.close();
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="nowrap" align="center">
        <Group gap={8} wrap="nowrap" align="baseline">
          <Text ff="var(--sw-font-hand)" fz={24} c="var(--sw-ink-2)" lh={1}>
            {name}
          </Text>
          {openCount > 0 && (
            <Text
              fz="xs"
              c="var(--sw-ink-3)"
              title={t("count.open", { count: openCount })}
            >
              {openCount}
            </Text>
          )}
        </Group>
        {!builtin && (
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="var(--sw-ink-3)"
                size="sm"
                aria-label={name}
              >
                <KebabIcon />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={openRename}>{t("lists.rename")}</Menu.Item>
              <Menu.Item
                style={{ color: "var(--sw-danger)" }}
                onClick={deleteHandlers.open}
              >
                {t("lists.delete")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <TaskList
        tasks={tasks}
        containerId={listContainerId(list.id)}
        emptyLabel={t("emptyList")}
        onToggle={(task) => useListsStore.getState().toggleDone(task)}
        onRename={(id, title) => useListsStore.getState().renameTask(id, title)}
        onDelete={(id) => useListsStore.getState().removeTask(id)}
        onMove={(task) => useUiStore.getState().openMove(task)}
      />
      <TaskComposer
        onAdd={(title) => useListsStore.getState().addTask(list.id, title)}
      />

      <Modal
        opened={renameOpened}
        onClose={renameHandlers.close}
        title={t("lists.renameTitle")}
        centered
      >
        <Stack gap="md">
          <TextInput
            autoFocus
            value={nameDraft}
            maxLength={120}
            placeholder={t("lists.namePlaceholder")}
            onChange={(event) => setNameDraft(event.currentTarget.value)}
            onKeyDown={renameKey}
          />
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={renameHandlers.close}>
              {t("lists.cancel")}
            </Button>
            <Button onClick={submitRename}>{t("lists.rename")}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={deleteHandlers.close}
        title={t("lists.deleteTitle")}
        centered
      >
        <Stack gap="md">
          <Text c="var(--sw-ink-2)">
            {t("lists.deleteWarning", { target: t("lists.tasks") })}
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={deleteHandlers.close}>
              {t("lists.cancel")}
            </Button>
            <Button color="var(--sw-danger)" onClick={confirmDelete}>
              {t("lists.deleteConfirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};
