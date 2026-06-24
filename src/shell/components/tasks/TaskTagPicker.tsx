import { Box, Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_TAG_COLOR,
  TAG_SWATCHES,
  tagSwatchValue,
} from "../../../data/tagColors.ts";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { useTagsStore } from "../../../state/tagsStore.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { CloseGlyph } from "../icons/glyphs.tsx";

const MAX_TAG_NAME = 40;

const Dot = ({ color, size = 10 }: { color: string; size?: number }) => (
  <span
    aria-hidden
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      flex: "0 0 auto",
    }}
  />
);

export const TaskTagPicker = ({ task }: { task: Task }) => {
  const { t } = useTranslation("tags");
  const tags = useTagsStore((state) => state.tags);
  const [opened, handlers] = useDisclosure(false);
  const [draft, setDraft] = useState("");

  const assigned = task.tagIds
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

  const nextColor =
    TAG_SWATCHES[tags.length % TAG_SWATCHES.length]?.id ?? DEFAULT_TAG_COLOR;

  const createAndAssign = () => {
    const name = draft.trim();
    if (name.length === 0) return;
    const existing = tags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (!task.tagIds.includes(existing.id)) {
        useTagsStore.getState().assignTag(task.id, existing.id);
      }
    } else {
      useTagsStore.getState().add(name, nextColor);
    }
    setDraft("");
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      createAndAssign();
    }
  };

  const toggle = (tagId: string) => {
    if (task.tagIds.includes(tagId)) {
      useTagsStore.getState().unassignTag(task.id, tagId);
    } else {
      useTagsStore.getState().assignTag(task.id, tagId);
    }
  };

  return (
    <>
      <Group gap={6} wrap="wrap">
        {assigned.map((tag) => (
          <Group
            key={tag.id}
            gap={5}
            wrap="nowrap"
            style={{
              paddingInline: "8px 4px",
              height: 26,
              borderRadius: 999,
              backgroundColor: `color-mix(in srgb, ${tagSwatchValue(tag.color)} 16%, transparent)`,
              border: `1px solid color-mix(in srgb, ${tagSwatchValue(tag.color)} 45%, transparent)`,
            }}
          >
            <Dot color={tagSwatchValue(tag.color)} size={8} />
            <Text fz="xs" fw={600} c="var(--sw-ink)">
              {tag.name}
            </Text>
            <UnstyledButton
              aria-label={t("removeFromTask", { name: tag.name })}
              onClick={() => useTagsStore.getState().unassignTag(task.id, tag.id)}
              style={{
                display: "inline-flex",
                color: "var(--sw-ink-3)",
                lineHeight: 0,
                padding: 2,
              }}
            >
              <CloseGlyph size={12} strokeWidth={2.4} />
            </UnstyledButton>
          </Group>
        ))}
        <UnstyledButton
          onClick={handlers.open}
          aria-haspopup="dialog"
          data-hint="tags"
          style={{
            height: 26,
            paddingInline: 10,
            borderRadius: 999,
            border: "1px dashed var(--sw-line)",
            color: "var(--sw-ink-2)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {assigned.length === 0 ? t("addFirst") : t("add")}
        </UnstyledButton>
      </Group>

      <ResponsiveDialog
        opened={opened}
        onClose={handlers.close}
        title={t("pickerTitle")}
      >
        <Stack gap="md">
          <TextInput
            autoFocus
            value={draft}
            maxLength={MAX_TAG_NAME}
            placeholder={t("createPlaceholder")}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={handleKey}
            leftSection={<Dot color={tagSwatchValue(nextColor)} />}
          />
          {tags.length === 0 ? (
            <Text fz="sm" c="var(--sw-ink-3)">
              {t("noneYet")}
            </Text>
          ) : (
            <Stack gap={2}>
              {tags.map((tag) => {
                const selected = task.tagIds.includes(tag.id);
                return (
                  <UnstyledButton
                    key={tag.id}
                    onClick={() => toggle(tag.id)}
                    aria-pressed={selected}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minHeight: 44,
                      paddingInline: 10,
                      borderRadius: "var(--mantine-radius-md)",
                      backgroundColor: selected
                        ? "var(--sw-paper-2)"
                        : "transparent",
                    }}
                  >
                    <Dot color={tagSwatchValue(tag.color)} size={12} />
                    <Text fz="sm" fw={600} c="var(--sw-ink)" style={{ flex: 1 }}>
                      {tag.name}
                    </Text>
                    {selected && (
                      <Box style={{ color: "var(--sw-accent)", lineHeight: 0 }}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M4 12l5 5L20 6" />
                        </svg>
                      </Box>
                    )}
                  </UnstyledButton>
                );
              })}
            </Stack>
          )}
        </Stack>
      </ResponsiveDialog>
    </>
  );
};
