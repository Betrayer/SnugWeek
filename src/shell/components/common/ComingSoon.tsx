import { Badge, Group, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ComingSoonProps {
  label: string;
  hint?: string;
  icon?: ReactNode;
}

export const ComingSoon = ({ label, hint, icon }: ComingSoonProps) => {
  const { t } = useTranslation("common");
  return (
    <Group
      gap="sm"
      wrap="nowrap"
      style={{
        padding: "10px 12px",
        borderRadius: "var(--mantine-radius-md)",
        border: "1px dashed var(--sw-line)",
      }}
    >
      {icon && (
        <span aria-hidden style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
          {icon}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text fz="sm" fw={600} c="var(--sw-ink-3)">
          {label}
        </Text>
        {hint && (
          <Text fz="xs" c="var(--sw-ink-3)">
            {hint}
          </Text>
        )}
      </div>
      <Badge
        variant="light"
        radius="sm"
        styles={{
          root: {
            backgroundColor: "var(--sw-highlight)",
            color: "var(--sw-ink-2)",
            textTransform: "none",
            fontWeight: 700,
          },
        }}
      >
        {t("soon")}
      </Badge>
    </Group>
  );
};
