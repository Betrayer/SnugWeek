import { Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

export const SidebarPanel = () => {
  const { t } = useTranslation("tasks");
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        backgroundColor: "var(--sw-paper-2)",
        borderInlineStart: "1px dashed var(--sw-line)",
        padding: "var(--mantine-spacing-lg)",
        paddingInlineStart: "calc(var(--mantine-spacing-lg) + 16px)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          insetBlock: 0,
          insetInlineStart: 5,
          width: 12,
          backgroundImage:
            "radial-gradient(circle at 6px 14px, var(--sw-paper) 4px, transparent 5px)",
          backgroundSize: "12px 28px",
          backgroundRepeat: "repeat-y",
        }}
      />
      <Stack gap="lg">
        <Text ff="var(--sw-font-hand)" fz={26} c="var(--sw-ink-2)">
          {t("lists.tasks")}
        </Text>
        <Text ff="var(--sw-font-hand)" fz={26} c="var(--sw-ink-2)">
          {t("lists.ideas")}
        </Text>
      </Stack>
    </div>
  );
};
