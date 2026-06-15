import { ActionIcon, Box, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { tagSwatchValue } from "../../data/tagColors.ts";
import { useTagsStore } from "../../state/tagsStore.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { ResponsiveDialog } from "../components/common/ResponsiveDialog.tsx";

const FilterIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 5h18l-7 8v6l-4-2v-4z" />
  </svg>
);

const Dot = ({ color }: { color: string }) => (
  <span
    aria-hidden
    style={{
      width: 12,
      height: 12,
      borderRadius: "50%",
      backgroundColor: color,
      flex: "0 0 auto",
    }}
  />
);

export const HeaderFilterSlot = () => {
  const { t } = useTranslation("tags");
  const tags = useTagsStore((state) => state.tags);
  const tagFilter = useUiStore((state) => state.tagFilter);
  const [opened, handlers] = useDisclosure(false);

  if (tags.length === 0) return null;

  const active = tagFilter.length > 0;

  return (
    <>
      <Tooltip label={t("filter")} withArrow>
        <ActionIcon
          variant="subtle"
          color={active ? "var(--sw-accent-2)" : "var(--sw-ink-2)"}
          aria-label={t("filter")}
          aria-haspopup="dialog"
          onClick={handlers.open}
          style={{ position: "relative" }}
        >
          <FilterIcon />
          {active && (
            <span
              style={{
                position: "absolute",
                top: -2,
                insetInlineEnd: -2,
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
        </ActionIcon>
      </Tooltip>

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
                <Dot color={tagSwatchValue(tag.color)} />
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
    </>
  );
};
