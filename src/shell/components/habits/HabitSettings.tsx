import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Habit } from "../../../services/repos/habitsRepo.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { ActionMenu } from "../common/ActionMenu.tsx";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { IconPicker } from "../trackers/IconPicker.tsx";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";
import { SortableItem } from "../settings/SortableItem.tsx";
import { SortableList } from "../settings/SortableList.tsx";

const MAX_NAME = 60;

export const HabitSettings = () => {
  const { t } = useTranslation("habits");
  const habits = useHabitsStore((state) => state.habits);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", icon: "star" });

  const active = habits.filter((habit) => !habit.archived);
  const archived = habits.filter((habit) => habit.archived);

  const openEdit = (habit: Habit) => {
    setEditing(habit);
    setEditDraft({ name: habit.name, icon: habit.icon ?? "star" });
  };
  const submitEdit = () => {
    if (!editing || editDraft.name.trim().length === 0) return;
    useHabitsStore
      .getState()
      .update(editing.id, { name: editDraft.name, icon: editDraft.icon });
    setEditing(null);
  };
  const editKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submitEdit();
    }
  };

  return (
    <Stack gap="sm">
      {active.length === 0 ? (
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("settings.empty")}
        </Text>
      ) : (
        <SortableList
          ids={active.map((habit) => habit.id)}
          onReorder={(ids) => useHabitsStore.getState().reorder(ids)}
        >
          <Stack gap={6}>
            {active.map((habit) => (
              <SortableItem
                key={habit.id}
                id={habit.id}
                handleLabel={t("settings.reorder")}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                    {habit.icon && (
                      <TrackerIcon
                        icon={habit.icon}
                        size={18}
                        color="var(--sw-ink-2)"
                      />
                    )}
                    <Text fw={600} c="var(--sw-ink)" truncate>
                      {habit.name}
                    </Text>
                  </Group>
                  <ActionMenu
                    label={t("menu", { name: habit.name })}
                    actions={[
                      {
                        key: "edit",
                        label: t("edit"),
                        onClick: () => openEdit(habit),
                      },
                      {
                        key: "archive",
                        label: t("archive"),
                        onClick: () =>
                          useHabitsStore.getState().setArchived(habit.id, true),
                      },
                    ]}
                  />
                </Group>
              </SortableItem>
            ))}
          </Stack>
        </SortableList>
      )}

      {archived.length > 0 && (
        <Stack gap={6}>
          <Text fz="xs" fw={700} c="var(--sw-ink-3)">
            {t("settings.archived")}
          </Text>
          {archived.map((habit) => (
            <Group key={habit.id} justify="space-between" wrap="nowrap">
              <Text c="var(--sw-ink-3)" truncate>
                {habit.name}
              </Text>
              <Button
                variant="subtle"
                size="compact-sm"
                c="var(--sw-ink-2)"
                onClick={() => useHabitsStore.getState().restore(habit.id)}
              >
                {t("restore")}
              </Button>
            </Group>
          ))}
        </Stack>
      )}

      <ResponsiveDialog
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={t("renameTitle")}
      >
        <Stack gap="md">
          <TextInput
            autoFocus
            label={t("settings.name")}
            value={editDraft.name}
            maxLength={MAX_NAME}
            placeholder={t("namePlaceholder")}
            onChange={(event) =>
              setEditDraft({ ...editDraft, name: event.currentTarget.value })
            }
            onKeyDown={editKey}
          />
          <IconPicker
            value={editDraft.icon}
            onChange={(icon) => setEditDraft({ ...editDraft, icon })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={() => setEditing(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={submitEdit} disabled={editDraft.name.trim().length === 0}>
              {t("save")}
            </Button>
          </Group>
        </Stack>
      </ResponsiveDialog>
    </Stack>
  );
};
