import { ActionIcon, Button, Group, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { todayIsoDay, weekDays } from "../../../services/time.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { BottomSheet } from "../common/BottomSheet.tsx";

const MAX_TITLE = 500;

const PlusIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MobileQuickAdd = () => {
  const { t } = useTranslation("tasks");
  const [opened, handlers] = useDisclosure(false);
  const [value, setValue] = useState("");
  const activeMobileDay = useUiStore((state) => state.activeMobileDay);
  const pendingQuickAdd = useUiStore((state) => state.pendingQuickAdd);
  const weekId = useWeekStore((state) => state.weekId);
  const language = useSettingsStore((state) => state.language);

  useEffect(() => {
    if (!pendingQuickAdd) return;
    useUiStore.getState().consumeQuickAdd();
    handlers.open();
  }, [pendingQuickAdd, handlers]);

  const day = activeMobileDay ?? todayIsoDay();
  const dayLabel = weekId
    ? weekDays(weekId, language).find((item) => item.iso === day)?.label
    : undefined;

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    useWeekStore.getState().addTask(day, trimmed);
    setValue("");
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  const close = () => {
    setValue("");
    handlers.close();
  };

  return (
    <>
      <ActionIcon
        radius="xl"
        size={56}
        aria-label={t("quickAdd.label")}
        aria-haspopup="dialog"
        aria-expanded={opened}
        onClick={handlers.open}
        style={{
          position: "fixed",
          insetInlineEnd: 16,
          bottom:
            "calc(var(--app-shell-footer-height, 64px) + env(safe-area-inset-bottom) + 14px)",
          zIndex: 60,
          backgroundColor: "var(--sw-accent)",
          color: "var(--sw-accent-ink)",
          boxShadow: "var(--sw-shadow)",
        }}
      >
        <PlusIcon />
      </ActionIcon>

      <BottomSheet
        opened={opened}
        onClose={close}
        title={dayLabel ? t("quickAdd.title", { day: dayLabel }) : t("quickAdd.label")}
      >
        <Stack gap="md" pt={4}>
          <TextInput
            autoFocus
            size="md"
            value={value}
            maxLength={MAX_TITLE}
            placeholder={t("composerPlaceholder")}
            onChange={(event) => setValue(event.currentTarget.value)}
            onKeyDown={handleKey}
            styles={{
              input: {
                backgroundColor: "var(--sw-card)",
                borderColor: "var(--sw-line)",
                color: "var(--sw-ink)",
                "--input-placeholder-color": "var(--sw-ink-3)",
              },
            }}
          />
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={close}>
              {t("lists.cancel")}
            </Button>
            <Button onClick={submit} disabled={value.trim().length === 0}>
              {t("add")}
            </Button>
          </Group>
        </Stack>
      </BottomSheet>
    </>
  );
};
