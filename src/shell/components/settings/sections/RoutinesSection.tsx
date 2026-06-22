import {
  Button,
  Chip,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  REMINDER_OFFSETS,
  offsetKey,
} from "../../../../services/reminders/offsets.ts";
import type {
  Routine,
  RoutineFields,
  RoutineFreq,
} from "../../../../services/repos/routinesRepo.ts";
import { formatTime, weekdayInitials } from "../../../../services/time.ts";
import { useRoutinesStore } from "../../../../state/routinesStore.ts";
import { useSettingsStore } from "../../../../state/settingsStore.ts";
import { ActionMenu } from "../../common/ActionMenu.tsx";
import { ResponsiveDialog } from "../../common/ResponsiveDialog.tsx";
import { fieldStyles } from "../../../styles/fieldStyles.ts";
import { cardSurface } from "../../../styles/surfaces.ts";

const MAX_NAME = 200;
const NONE = "none";

interface Draft {
  title: string;
  freq: RoutineFreq;
  days: number[];
  time: string;
  remindOffsetMin: number | null;
  active: boolean;
}

const emptyDraft = (): Draft => ({
  title: "",
  freq: "daily",
  days: [],
  time: "",
  remindOffsetMin: null,
  active: true,
});

const draftFromRoutine = (routine: Routine): Draft => ({
  title: routine.title,
  freq: routine.freq,
  days: routine.days,
  time: routine.time ?? "",
  remindOffsetMin: routine.remindOffsetMin,
  active: routine.active,
});

const toFields = (draft: Draft): RoutineFields => ({
  title: draft.title,
  freq: draft.freq,
  days: draft.days,
  time: draft.time === "" ? null : draft.time,
  remindOffsetMin: draft.time === "" ? null : draft.remindOffsetMin,
  active: draft.active,
});

interface RoutineEditorProps {
  opened: boolean;
  title: string;
  draft: Draft;
  onChange: (draft: Draft) => void;
  onClose: () => void;
  onSave: () => void;
}

const RoutineEditor = ({
  opened,
  title,
  draft,
  onChange,
  onClose,
  onSave,
}: RoutineEditorProps) => {
  const { t } = useTranslation(["routines", "reminders"]);
  const language = useSettingsStore((state) => state.language);
  const initials = useMemo(() => weekdayInitials(language), [language]);

  const hasTime = draft.time !== "";
  const canSave =
    draft.title.trim().length > 0 &&
    (draft.freq === "daily" || draft.days.length > 0);

  const reminderData = [
    { value: NONE, label: t("reminders:offsets.none") },
    ...REMINDER_OFFSETS.map((minutes) => ({
      value: String(minutes),
      label: t(`reminders:offsets.${offsetKey(minutes)}`),
    })),
  ];

  const onTimeChange = (event: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...draft, time: event.currentTarget.value });

  return (
    <ResponsiveDialog opened={opened} onClose={onClose} title={title}>
      <Stack gap="md">
        <TextInput
          autoFocus
          label={t("name")}
          value={draft.title}
          maxLength={MAX_NAME}
          placeholder={t("namePlaceholder")}
          onChange={(event) =>
            onChange({ ...draft, title: event.currentTarget.value })
          }
          styles={fieldStyles}
        />

        <Stack gap={6}>
          <Text fz="sm" fw={600} c="var(--sw-ink-2)">
            {t("frequency")}
          </Text>
          <SegmentedControl
            value={draft.freq}
            onChange={(value) => {
              if (value === "daily" || value === "weekly")
                onChange({ ...draft, freq: value });
            }}
            data={[
              { value: "daily", label: t("daily") },
              { value: "weekly", label: t("weekly") },
            ]}
          />
          {draft.freq === "daily" ? (
            <Text fz="xs" c="var(--sw-ink-3)">
              {t("dailyHint")}
            </Text>
          ) : (
            <Stack gap={6}>
              <Chip.Group
                multiple
                value={draft.days.map(String)}
                onChange={(value) =>
                  onChange({
                    ...draft,
                    days: value.map(Number).sort((a, b) => a - b),
                  })
                }
              >
                <Group gap={6} wrap="nowrap">
                  {initials.map((initial, index) => (
                    <Chip key={index} value={String(index + 1)} size="sm">
                      {initial}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
              {draft.days.length === 0 && (
                <Text fz="xs" c="var(--sw-ink-3)">
                  {t("daysHint")}
                </Text>
              )}
            </Stack>
          )}
        </Stack>

        <Group align="flex-end" gap="sm" wrap="nowrap">
          <TimeInput
            label={t("timeLabel")}
            value={draft.time}
            onChange={onTimeChange}
            styles={fieldStyles}
            style={{ flex: 1 }}
          />
          <Button
            variant="subtle"
            color="var(--sw-ink-2)"
            onClick={() => onChange({ ...draft, time: "" })}
            disabled={!hasTime}
          >
            {t("clearTime")}
          </Button>
        </Group>

        <Select
          label={t("reminderLabel")}
          data={reminderData}
          value={
            draft.remindOffsetMin === null ? NONE : String(draft.remindOffsetMin)
          }
          onChange={(value) =>
            onChange({
              ...draft,
              remindOffsetMin:
                value === null || value === NONE ? null : Number(value),
            })
          }
          disabled={!hasTime}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
          styles={fieldStyles}
        />

        <Switch
          checked={draft.active}
          onChange={(event) =>
            onChange({ ...draft, active: event.currentTarget.checked })
          }
          label={t("active")}
          description={t("activeHint")}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" c="var(--sw-ink-2)" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
            {t("save")}
          </Button>
        </Group>
      </Stack>
    </ResponsiveDialog>
  );
};

export const RoutinesSection = () => {
  const { t } = useTranslation("routines");
  const language = useSettingsStore((state) => state.language);
  const routines = useRoutinesStore((state) => state.routines);
  const initials = useMemo(() => weekdayInitials(language), [language]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const describe = (routine: Routine): string => {
    const base =
      routine.freq === "daily"
        ? t("everyDay")
        : routine.days.map((day) => initials[day - 1] ?? "").join(" · ");
    return routine.time !== null ? `${base} · ${formatTime(routine.time)}` : base;
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setEditorOpen(true);
  };

  const openEdit = (routine: Routine) => {
    setEditingId(routine.id);
    setDraft(draftFromRoutine(routine));
    setEditorOpen(true);
  };

  const save = () => {
    const store = useRoutinesStore.getState();
    if (editingId) {
      store.update(editingId, toFields(draft));
    } else {
      store.add(toFields(draft));
    }
    setEditorOpen(false);
  };

  return (
    <Stack gap="md">
      <Text fz="sm" c="var(--sw-ink-3)">
        {t("hint")}
      </Text>

      <Group justify="flex-end">
        <Button onClick={openCreate}>{t("create")}</Button>
      </Group>

      {routines.length === 0 ? (
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("empty")}
        </Text>
      ) : (
        <Stack gap={6}>
          {routines.map((routine) => (
            <Group
              key={routine.id}
              justify="space-between"
              wrap="nowrap"
              gap="sm"
              style={{ padding: "8px 12px", ...cardSurface("md") }}
            >
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text
                  fw={600}
                  truncate
                  c={routine.active ? "var(--sw-ink)" : "var(--sw-ink-3)"}
                >
                  {routine.title}
                </Text>
                <Text fz="xs" c="var(--sw-ink-3)">
                  {routine.active ? describe(routine) : t("paused")}
                </Text>
              </Stack>
              <Group gap={4} wrap="nowrap">
                <Switch
                  checked={routine.active}
                  onChange={(event) =>
                    useRoutinesStore
                      .getState()
                      .setActive(routine.id, event.currentTarget.checked)
                  }
                  aria-label={t("active")}
                  size="sm"
                />
                <ActionMenu
                  label={t("menu", { name: routine.title })}
                  actions={[
                    {
                      key: "edit",
                      label: t("edit"),
                      onClick: () => openEdit(routine),
                    },
                    {
                      key: "delete",
                      label: t("delete"),
                      danger: true,
                      onClick: () =>
                        useRoutinesStore.getState().remove(routine.id),
                      confirm: {
                        title: t("deleteTitle"),
                        body: t("deleteWarning", { name: routine.title }),
                        confirmLabel: t("delete"),
                      },
                    },
                  ]}
                />
              </Group>
            </Group>
          ))}
        </Stack>
      )}

      <RoutineEditor
        opened={editorOpen}
        title={editingId ? t("editTitle") : t("createTitle")}
        draft={draft}
        onChange={setDraft}
        onClose={() => setEditorOpen(false)}
        onSave={save}
      />
    </Stack>
  );
};
