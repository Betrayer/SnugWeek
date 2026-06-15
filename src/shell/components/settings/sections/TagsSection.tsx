import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_TAG_COLOR, tagSwatchValue } from "../../../../data/tagColors.ts";
import type { Tag } from "../../../../services/repos/tagsRepo.ts";
import { useTagsStore } from "../../../../state/tagsStore.ts";
import { ActionMenu } from "../../common/ActionMenu.tsx";
import { ResponsiveDialog } from "../../common/ResponsiveDialog.tsx";
import { SwatchPicker } from "../../tags/SwatchPicker.tsx";
import { SortableItem } from "../SortableItem.tsx";
import { SortableList } from "../SortableList.tsx";

const MAX_NAME = 40;

const Dot = ({ color }: { color: string }) => (
  <span
    aria-hidden
    style={{
      width: 14,
      height: 14,
      borderRadius: "50%",
      backgroundColor: color,
      flex: "0 0 auto",
    }}
  />
);

export const TagsSection = () => {
  const { t } = useTranslation("tags");
  const tags = useTagsStore((state) => state.tags);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_TAG_COLOR);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", color: DEFAULT_TAG_COLOR });

  const submitNew = () => {
    if (newName.trim().length === 0) return;
    useTagsStore.getState().add(newName, newColor);
    setNewName("");
  };

  const newKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submitNew();
    }
  };

  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setEditDraft({ name: tag.name, color: tag.color });
  };

  const submitEdit = () => {
    if (!editing || editDraft.name.trim().length === 0) return;
    useTagsStore
      .getState()
      .update(editing.id, { name: editDraft.name, color: editDraft.color });
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
    <Stack gap="md">
      <Text fz="sm" c="var(--sw-ink-3)">
        {t("settingsHint")}
      </Text>

      <Stack gap="sm">
        <TextInput
          value={newName}
          maxLength={MAX_NAME}
          placeholder={t("namePlaceholder")}
          aria-label={t("name")}
          onChange={(event) => setNewName(event.currentTarget.value)}
          onKeyDown={newKey}
          leftSection={<Dot color={tagSwatchValue(newColor)} />}
        />
        <SwatchPicker value={newColor} onChange={setNewColor} />
        <Group justify="flex-end">
          <Button onClick={submitNew} disabled={newName.trim().length === 0}>
            {t("create")}
          </Button>
        </Group>
      </Stack>

      {tags.length === 0 ? (
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("empty")}
        </Text>
      ) : (
        <SortableList
          ids={tags.map((tag) => tag.id)}
          onReorder={(ids) => useTagsStore.getState().reorder(ids)}
        >
          <Stack gap={6}>
            {tags.map((tag) => (
              <SortableItem
                key={tag.id}
                id={tag.id}
                handleLabel={t("reorder")}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                    <Dot color={tagSwatchValue(tag.color)} />
                    <Text fw={600} c="var(--sw-ink)" truncate>
                      {tag.name}
                    </Text>
                  </Group>
                  <ActionMenu
                    label={t("menu", { name: tag.name })}
                    actions={[
                      {
                        key: "edit",
                        label: t("edit"),
                        onClick: () => openEdit(tag),
                      },
                      {
                        key: "delete",
                        label: t("delete"),
                        danger: true,
                        onClick: () => useTagsStore.getState().remove(tag.id),
                        confirm: {
                          title: t("deleteTitle"),
                          body: t("deleteWarning", { name: tag.name }),
                          confirmLabel: t("delete"),
                        },
                      },
                    ]}
                  />
                </Group>
              </SortableItem>
            ))}
          </Stack>
        </SortableList>
      )}

      <ResponsiveDialog
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={t("editTitle")}
      >
        <Stack gap="md">
          <TextInput
            autoFocus
            label={t("name")}
            value={editDraft.name}
            maxLength={MAX_NAME}
            placeholder={t("namePlaceholder")}
            onChange={(event) =>
              setEditDraft({ ...editDraft, name: event.currentTarget.value })
            }
            onKeyDown={editKey}
          />
          <SwatchPicker
            value={editDraft.color}
            onChange={(color) => setEditDraft({ ...editDraft, color })}
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              c="var(--sw-ink-2)"
              onClick={() => setEditing(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={submitEdit}
              disabled={editDraft.name.trim().length === 0}
            >
              {t("save")}
            </Button>
          </Group>
        </Stack>
      </ResponsiveDialog>
    </Stack>
  );
};
