import { Button, Group, Paper } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useDecorStore } from "../../../state/decorStore.ts";
import { useIsMobile } from "../../hooks/useIsMobile.ts";

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const DecorEditBar = () => {
  const { t } = useTranslation("decor");
  const editMode = useDecorStore((state) => state.editMode);
  const isMobile = useIsMobile();

  if (!editMode) return null;

  return (
    <Paper
      role="toolbar"
      aria-label={t("editToolbar")}
      shadow="md"
      radius="xl"
      withBorder
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: isMobile
          ? "calc(64px + env(safe-area-inset-bottom) + 12px)"
          : "calc(env(safe-area-inset-bottom) + 20px)",
        zIndex: 200,
        backgroundColor: "var(--sw-paper)",
        borderColor: "var(--sw-line)",
        padding: "6px 10px",
      }}
    >
      <Group gap="xs" wrap="nowrap">
        <Button
          size="compact-sm"
          radius="xl"
          leftSection={<PlusIcon />}
          color="var(--sw-accent)"
          onClick={() => useDecorStore.getState().openPalette()}
        >
          {t("addDecoration")}
        </Button>
        <Button
          size="compact-sm"
          radius="xl"
          variant="subtle"
          c="var(--sw-ink-2)"
          onClick={() => useDecorStore.getState().exitEdit()}
        >
          {t("done")}
        </Button>
      </Group>
    </Paper>
  );
};
