import { Button, Group, Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface UpdateToastProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateToast = ({ onUpdate, onDismiss }: UpdateToastProps) => {
  const { t } = useTranslation("common");
  return (
    <Paper
      shadow="md"
      radius="lg"
      p="sm"
      withBorder
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)",
        transform: "translateX(-50%)",
        zIndex: 400,
        width: "min(440px, calc(100vw - 24px))",
        backgroundColor: "var(--sw-card)",
        borderColor: "var(--sw-line)",
      }}
    >
      <Group wrap="nowrap" gap="sm" align="center">
        <Text fz="sm" c="var(--sw-ink)" style={{ flex: 1 }}>
          {t("update.message")}
        </Text>
        <Button
          size="xs"
          radius="md"
          onClick={onUpdate}
          styles={{
            root: {
              backgroundColor: "var(--sw-accent)",
              color: "var(--sw-accent-ink)",
            },
          }}
        >
          {t("update.action")}
        </Button>
        <Button
          size="xs"
          radius="md"
          variant="subtle"
          c="var(--sw-ink-2)"
          onClick={onDismiss}
        >
          {t("update.dismiss")}
        </Button>
      </Group>
    </Paper>
  );
};
