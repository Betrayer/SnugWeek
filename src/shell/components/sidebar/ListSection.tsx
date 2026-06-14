import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { isBuiltinList } from "../../../services/repos/listsRepo.ts";
import type { List } from "../../../services/repos/listsRepo.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { weekDays } from "../../../services/time.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { listContainerId, listDragId } from "../tasks/dndIds.ts";
import { TaskComposer } from "../tasks/TaskComposer.tsx";
import { TaskList } from "../tasks/TaskList.tsx";

interface ListSectionProps {
  list: List;
  hideName?: boolean;
  collapsible?: boolean;
}

const EMPTY: Task[] = [];

const KebabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={{
      transform: open ? "rotate(90deg)" : "none",
      transition: "transform 150ms ease",
    }}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const ListSection = ({
  list,
  hideName = false,
  collapsible = false,
}: ListSectionProps) => {
  const { t } = useTranslation("tasks");
  const tasks = useListsStore((state) => state.tasksByList[list.id] ?? EMPTY);
  const weekId = useWeekStore((state) => state.weekId);
  const language = useSettingsStore((state) => state.language);
  const [renameOpened, renameHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [moveOpened, moveHandlers] = useDisclosure(false);
  const [collapsed, setCollapsed] = useState(collapsible);
  const [nameDraft, setNameDraft] = useState("");

  const builtin = isBuiltinList(list.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: listDragId(list.id),
    disabled: builtin,
  });
  const days = weekId ? weekDays(weekId, language) : [];

  const assignToDay = (iso: number) => {
    useListsStore.getState().assignListToDay(list.id, iso);
    moveHandlers.close();
  };
  const name = builtin ? t(`lists.${list.kind}`) : (list.name ?? "");
  const openCount = tasks.filter((task) => task.status === "open").length;
  const emptyLabel =
    list.kind === "ideas"
      ? t("emptyIdeas")
      : list.kind === "tasks"
        ? t("emptyTasks")
        : t("emptyList");
  const bodyVisible = !collapsible || !collapsed;

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
    <Stack gap="xs" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {!hideName && (
        <Group justify="space-between" wrap="nowrap" align="center">
          <Group gap={4} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
            {!builtin && (
              <UnstyledButton
                ref={setNodeRef}
                aria-label={t("lists.dragHandle", { name })}
                style={{
                  flex: "0 0 auto",
                  color: "var(--sw-ink-3)",
                  cursor: "grab",
                  touchAction: "none",
                  display: "inline-flex",
                }}
                {...attributes}
                {...listeners}
              >
                <GripIcon />
              </UnstyledButton>
            )}
            {collapsible && (
              <ActionIcon
                variant="subtle"
                color="var(--sw-ink-3)"
                size="sm"
                aria-label={collapsed ? t("lists.expand") : t("lists.collapse")}
                onClick={() => setCollapsed((value) => !value)}
              >
                <ChevronIcon open={!collapsed} />
              </ActionIcon>
            )}
            <Text
              ff="var(--sw-font-hand)"
              fz={24}
              c="var(--sw-ink-2)"
              lh={1}
              truncate
            >
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
                  disabled={days.length === 0}
                  onClick={moveHandlers.open}
                >
                  {t("lists.moveToDay")}
                </Menu.Item>
                {list.day !== null && (
                  <Menu.Item
                    onClick={() => useListsStore.getState().unassignList(list.id)}
                  >
                    {t("lists.backToSidebar")}
                  </Menu.Item>
                )}
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
      )}

      {bodyVisible && (
        <>
          <TaskList
            tasks={tasks}
            containerId={listContainerId(list.id)}
            emptyLabel={emptyLabel}
            onToggle={(task) => useListsStore.getState().toggleDone(task)}
            onRename={(id, title) =>
              useListsStore.getState().renameTask(id, title)
            }
            onDelete={(id) => useListsStore.getState().removeTask(id)}
            onMove={(task) => useUiStore.getState().openMove(task)}
          />
          <TaskComposer
            onAdd={(title) => useListsStore.getState().addTask(list.id, title)}
          />
        </>
      )}

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

      <Modal
        opened={moveOpened}
        onClose={moveHandlers.close}
        title={t("lists.moveToDayTitle", { name })}
        centered
      >
        <Group gap="xs">
          {days.map((day) => (
            <Button
              key={day.iso}
              size="compact-sm"
              variant={list.day === day.iso ? "filled" : "light"}
              onClick={() => assignToDay(day.iso)}
            >
              {day.label}
            </Button>
          ))}
        </Group>
      </Modal>
    </Stack>
  );
};
