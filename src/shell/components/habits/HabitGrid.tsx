import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Fragment, useEffect, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Habit } from "../../../services/repos/habitsRepo.ts";
import { weekDays } from "../../../services/time.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";
import { HabitComposer } from "./HabitComposer.tsx";

const MAX_NAME = 60;
const EMPTY_CHECKS: Record<string, Record<string, true>> = {};

const CheckGlyph = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--sw-accent-ink)"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M5 12l4.5 4.5L19 7" />
  </svg>
);

const KebabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(84px, 1.4fr) repeat(7, minmax(26px, 1fr))",
  gap: 5,
  alignItems: "center",
  minWidth: 300,
};

const headStyle = (today: boolean): CSSProperties => ({
  textAlign: "center",
  fontSize: "var(--mantine-font-size-xs)",
  fontWeight: 700,
  color: today ? "var(--sw-accent-2)" : "var(--sw-ink-3)",
});

const cellStyle = (today: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingBlock: 2,
  borderRadius: "var(--mantine-radius-sm)",
  backgroundColor: today
    ? "color-mix(in srgb, var(--sw-accent) 8%, transparent)"
    : "transparent",
});

const checkStyle = (checked: boolean): CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1.5px solid ${checked ? "var(--sw-accent)" : "var(--sw-line)"}`,
  backgroundColor: checked ? "var(--sw-accent)" : "transparent",
  transition: "background-color 120ms ease, border-color 120ms ease",
});

export const HabitGrid = () => {
  const { t } = useTranslation("habits");
  const habits = useHabitsStore((state) => state.habits);
  const streaks = useHabitsStore((state) => state.streaks);
  const checks = useWeekStore((state) => state.week?.habitChecks ?? EMPTY_CHECKS);
  const weekId = useWeekStore((state) => state.weekId);
  const language = useSettingsStore((state) => state.language);
  const [renaming, setRenaming] = useState<Habit | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [renameOpened, renameHandlers] = useDisclosure(false);
  const checksKey = JSON.stringify(checks);

  useEffect(() => {
    useHabitsStore.getState().refreshStreaks();
  }, [checksKey]);

  if (!weekId) return null;
  const active = habits.filter((habit) => !habit.archived);
  const days = weekDays(weekId, language);

  const openRename = (habit: Habit) => {
    setRenaming(habit);
    setNameDraft(habit.name);
    renameHandlers.open();
  };
  const submitRename = () => {
    if (renaming) {
      useHabitsStore
        .getState()
        .update(renaming.id, { name: nameDraft, icon: renaming.icon });
    }
    renameHandlers.close();
  };
  const renameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submitRename();
    }
  };

  return (
    <Stack gap="sm">
      {active.length === 0 ? (
        <Text ff="var(--sw-font-hand)" fz="lg" c="var(--sw-ink-3)">
          {t("empty")}
        </Text>
      ) : (
        <Box style={{ overflowX: "auto" }} className="sw-hide-scrollbar">
          <div style={gridStyle}>
            <span />
            {days.map((day) => (
              <span key={day.iso} style={headStyle(day.isToday)}>
                {day.initial}
              </span>
            ))}
            {active.map((habit) => {
              const streak = streaks[habit.id] ?? 0;
              return (
                <Fragment key={habit.id}>
                  <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                    {habit.icon && (
                      <TrackerIcon
                        icon={habit.icon}
                        size={16}
                        color="var(--sw-ink-3)"
                      />
                    )}
                    <Text fz="sm" fw={600} c="var(--sw-ink)" truncate style={{ flex: 1 }}>
                      {habit.name}
                    </Text>
                    {streak >= 2 && (
                      <Text fz="xs" fw={700} c="var(--sw-accent-2)" style={{ whiteSpace: "nowrap" }}>
                        🔥{streak}
                      </Text>
                    )}
                    <Menu position="bottom-end">
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="var(--sw-ink-3)"
                          size="sm"
                          aria-label={t("menu", { name: habit.name })}
                        >
                          <KebabIcon />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => openRename(habit)}>
                          {t("rename")}
                        </Menu.Item>
                        <Menu.Item
                          onClick={() =>
                            useHabitsStore.getState().setArchived(habit.id, true)
                          }
                        >
                          {t("archive")}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                  {days.map((day) => {
                    const checked = checks[habit.id]?.[String(day.iso)] === true;
                    return (
                      <div key={day.iso} style={cellStyle(day.isToday)}>
                        <UnstyledButton
                          onClick={() =>
                            useWeekStore.getState().toggleHabit(habit.id, day.iso)
                          }
                          aria-label={t("check", {
                            name: habit.name,
                            day: day.label,
                          })}
                          aria-pressed={checked}
                          style={checkStyle(checked)}
                        >
                          {checked && <CheckGlyph />}
                        </UnstyledButton>
                      </div>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        </Box>
      )}
      <HabitComposer />

      <Modal
        opened={renameOpened}
        onClose={renameHandlers.close}
        title={t("renameTitle")}
        centered
      >
        <Stack gap="md">
          <TextInput
            autoFocus
            value={nameDraft}
            maxLength={MAX_NAME}
            placeholder={t("namePlaceholder")}
            onChange={(event) => setNameDraft(event.currentTarget.value)}
            onKeyDown={renameKey}
          />
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={renameHandlers.close}>
              {t("cancel")}
            </Button>
            <Button onClick={submitRename} disabled={nameDraft.trim().length === 0}>
              {t("save")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};
