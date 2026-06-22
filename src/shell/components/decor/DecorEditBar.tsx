import { Button, Group, Paper } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useDecorStore } from "../../../state/decorStore.ts";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { PlusGlyph } from "../icons/glyphs.tsx";

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
          leftSection={<PlusGlyph size={16} strokeWidth={2} />}
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
