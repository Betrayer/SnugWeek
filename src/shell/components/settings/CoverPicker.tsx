import { Box, Group, Radio, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { COVERS, DEFAULT_COVER_ID } from "../../../data/covers.ts";
import { useProfileStore } from "../../../state/profileStore.ts";

export const CoverPicker = () => {
  const { t } = useTranslation(["settings", "common"]);
  const coverStyle = useProfileStore((state) => state.coverStyle);
  const notebookName = useProfileStore((state) => state.notebookName);
  const value = coverStyle ?? DEFAULT_COVER_ID;
  const plate = notebookName ?? t("common:appName");

  return (
    <Radio.Group
      value={value}
      onChange={(next) =>
        useProfileStore
          .getState()
          .setCoverStyle(next === DEFAULT_COVER_ID ? null : next)
      }
      aria-label={t("settings:coverStyle")}
    >
      <Group gap="sm">
        {COVERS.map((cover) => {
          const active = cover.id === value;
          return (
            <Radio.Card
              key={cover.id}
              value={cover.id}
              radius="md"
              p={4}
              style={{
                width: 96,
                borderColor: active ? "var(--sw-accent)" : "var(--sw-line)",
                borderWidth: 2,
                backgroundColor: "var(--sw-card)",
                cursor: "pointer",
              }}
            >
              <Stack gap={4}>
                <Box
                  aria-hidden
                  style={{
                    height: 58,
                    borderRadius: 8,
                    background: cover.background,
                    border: "1px solid color-mix(in srgb, var(--sw-ink) 12%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      maxWidth: "84%",
                      padding: "2px 8px",
                      borderRadius: 6,
                      backgroundColor: "var(--sw-card)",
                      border: "1px solid var(--sw-line)",
                      fontFamily: "var(--sw-font-hand)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--sw-ink-2)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {plate}
                  </span>
                </Box>
                <Text fz="xs" fw={600} ta="center" c="var(--sw-ink)">
                  {t(`settings:coverNames.${cover.id}`)}
                </Text>
              </Stack>
            </Radio.Card>
          );
        })}
      </Group>
    </Radio.Group>
  );
};
