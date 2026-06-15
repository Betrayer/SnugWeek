import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { tagSwatchValue } from "../../../data/tagColors.ts";
import { useTagsStore } from "../../../state/tagsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";

const FilterIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 5h18l-7 8v6l-4-2v-4z" />
  </svg>
);

const Dot = ({ color, size = 8 }: { color: string; size?: number }) => (
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

export const TagFilterBar = () => {
  const { t } = useTranslation("tags");
  const tags = useTagsStore((state) => state.tags);
  const tagFilter = useUiStore((state) => state.tagFilter);
  const [opened, handlers] = useDisclosure(false);

  if (tags.length === 0) return null;

  const active = tagFilter.length > 0;
  const activeTags = tagFilter
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

  return (
    <Group
      gap={6}
      wrap="wrap"
      align="center"
      role="group"
      aria-label={t("filterRegion")}
    >
      <UnstyledButton
        onClick={handlers.open}
        aria-haspopup="dialog"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 30,
          paddingInline: 12,
          borderRadius: 999,
          border: `1px solid ${active ? "var(--sw-accent)" : "var(--sw-line)"}`,
          backgroundColor: active
            ? "color-mix(in srgb, var(--sw-accent) 12%, transparent)"
            : "var(--sw-card)",
          color: active ? "var(--sw-accent-2)" : "var(--sw-ink-2)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <FilterIcon />
        {t("filter")}
        {active && (
          <span
            style={{
              minWidth: 16,
              height: 16,
              paddingInline: 4,
              borderRadius: 8,
              backgroundColor: "var(--sw-accent)",
              color: "var(--sw-accent-ink)",
              fontSize: 10,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {tagFilter.length}
          </span>
        )}
      </UnstyledButton>

      <Group gap={6} wrap="wrap" role="status" aria-live="polite">
        {activeTags.map((tag) => (
          <Group
            key={tag.id}
            gap={5}
            wrap="nowrap"
            style={{
              paddingInline: "8px 4px",
              height: 28,
              borderRadius: 999,
              backgroundColor: `color-mix(in srgb, ${tagSwatchValue(tag.color)} 16%, transparent)`,
              border: `1px solid color-mix(in srgb, ${tagSwatchValue(tag.color)} 45%, transparent)`,
            }}
          >
            <Dot color={tagSwatchValue(tag.color)} />
            <Text fz="xs" fw={600} c="var(--sw-ink)">
              {tag.name}
            </Text>
            <UnstyledButton
              aria-label={t("removeFromFilter", { name: tag.name })}
              onClick={() => useUiStore.getState().removeFromTagFilter(tag.id)}
              style={{
                display: "inline-flex",
                color: "var(--sw-ink-3)",
                lineHeight: 0,
                padding: 2,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </UnstyledButton>
          </Group>
        ))}
      </Group>

      {active && (
        <UnstyledButton
          onClick={() => useUiStore.getState().clearTagFilter()}
          style={{
            height: 28,
            paddingInline: 10,
            borderRadius: 999,
            color: "var(--sw-ink-2)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {t("clear")}
        </UnstyledButton>
      )}

      <ResponsiveDialog
        opened={opened}
        onClose={handlers.close}
        title={t("filterTitle")}
      >
        <Stack gap={2}>
          {tags.map((tag) => {
            const selected = tagFilter.includes(tag.id);
            return (
              <UnstyledButton
                key={tag.id}
                onClick={() => useUiStore.getState().toggleTagFilter(tag.id)}
                aria-pressed={selected}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: 44,
                  paddingInline: 10,
                  borderRadius: "var(--mantine-radius-md)",
                  backgroundColor: selected ? "var(--sw-paper-2)" : "transparent",
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
        {active && (
          <UnstyledButton
            onClick={() => useUiStore.getState().clearTagFilter()}
            style={{
              marginTop: 12,
              height: 36,
              paddingInline: 12,
              borderRadius: "var(--mantine-radius-md)",
              color: "var(--sw-ink-2)",
              fontWeight: 600,
            }}
          >
            {t("clear")}
          </UnstyledButton>
        )}
      </ResponsiveDialog>
    </Group>
  );
};
