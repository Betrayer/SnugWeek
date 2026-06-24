import {
  Button,
  CheckIcon,
  ColorSwatch,
  Group,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_TRACKER_COLOR,
  TRACKER_SWATCHES,
  trackerColorValue,
} from "../../../data/trackerColors.ts";
import type {
  Tracker,
  TrackerType,
} from "../../../services/repos/trackersRepo.ts";
import { useTrackersStore } from "../../../state/trackersStore.ts";
import { ActionMenu } from "../common/ActionMenu.tsx";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { SortableItem } from "../settings/SortableItem.tsx";
import { SortableList } from "../settings/SortableList.tsx";
import { IconPicker } from "./IconPicker.tsx";
import { TrackerIcon } from "./TrackerIcon.tsx";
import { trackerDisplayName } from "./trackerName.ts";

const MAX_NAME = 60;
const TRACKER_TYPES: TrackerType[] = ["scale5", "emoji", "number", "checkbox"];
const DEFAULT_DRAFT = {
  name: "",
  type: "scale5" as TrackerType,
  icon: "star",
  color: DEFAULT_TRACKER_COLOR,
};

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const TrackerColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <Stack gap={4}>
    <Text fz="sm" fw={600} c="var(--sw-ink-2)">
      {label}
    </Text>
    <Group gap={8}>
      {TRACKER_SWATCHES.map((swatch) => (
        <UnstyledButton
          key={swatch.id}
          onClick={() => onChange(swatch.id)}
          aria-label={swatch.id}
          aria-pressed={value === swatch.id}
        >
          <ColorSwatch
            color={swatch.value}
            size={26}
            withShadow={false}
            style={{
              color: "var(--mantine-color-white)",
              outline:
                value === swatch.id ? "2px solid var(--sw-ink-2)" : "none",
              outlineOffset: 2,
            }}
          >
            {value === swatch.id && <CheckIcon style={{ width: 12, height: 12 }} />}
          </ColorSwatch>
        </UnstyledButton>
      ))}
    </Group>
  </Stack>
);

export const TrackerSettings = () => {
  const { t } = useTranslation(["trackers", "common"]);
  const trackers = useTrackersStore((state) => state.trackers);
  const [addOpened, addHandlers] = useDisclosure(false);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [editing, setEditing] = useState<Tracker | null>(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    icon: "",
    color: DEFAULT_TRACKER_COLOR,
  });

  const typeLabel = (type: TrackerType): string =>
    t(`settings.type.${type}`);

  const openAdd = () => {
    setDraft(DEFAULT_DRAFT);
    addHandlers.open();
  };
  const submitAdd = () => {
    if (draft.name.trim().length === 0) return;
    useTrackersStore.getState().add({
      name: draft.name,
      type: draft.type,
      icon: draft.icon,
      color: draft.color,
    });
    addHandlers.close();
  };

  const openEdit = (tracker: Tracker) => {
    setEditing(tracker);
    setEditDraft({
      name: trackerDisplayName(tracker, t),
      icon: tracker.icon,
      color: tracker.color,
    });
  };
  const submitEdit = () => {
    if (!editing || editDraft.name.trim().length === 0) return;
    useTrackersStore.getState().update(editing.id, {
      name: editDraft.name,
      icon: editDraft.icon,
      color: editDraft.color,
    });
    setEditing(null);
  };

  const addKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submitAdd();
    }
  };
  const editKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submitEdit();
    }
  };

  return (
    <Stack gap="sm">
      {trackers.length === 0 ? (
        <Text fz="sm" c="var(--sw-ink-3)">
          {t("settings.empty")}
        </Text>
      ) : (
        <SortableList
          ids={trackers.map((tracker) => tracker.id)}
          onReorder={(ids) => useTrackersStore.getState().reorder(ids)}
        >
          <Stack gap={6}>
            {trackers.map((tracker) => {
              const name = trackerDisplayName(tracker, t);
              return (
                <SortableItem
                  key={tracker.id}
                  id={tracker.id}
                  handleLabel={t("settings.reorder")}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                      <TrackerIcon
                        icon={tracker.icon}
                        size={18}
                        color={trackerColorValue(tracker.color)}
                      />
                      <div style={{ minWidth: 0 }}>
                        <Text fw={600} c="var(--sw-ink)" truncate>
                          {name}
                        </Text>
                        <Text fz="xs" c="var(--sw-ink-3)">
                          {typeLabel(tracker.type)}
                        </Text>
                      </div>
                    </Group>
                    <Group gap={4} wrap="nowrap">
                      <Switch
                        size="sm"
                        checked={tracker.enabled}
                        aria-label={t("settings.enabledLabel", { name })}
                        onChange={(event) =>
                          useTrackersStore
                            .getState()
                            .setEnabled(tracker.id, event.currentTarget.checked)
                        }
                      />
                      <ActionMenu
                        label={t("settings.menu", { name })}
                        actions={[
                          {
                            key: "edit",
                            label: t("settings.edit"),
                            onClick: () => openEdit(tracker),
                          },
                          {
                            key: "delete",
                            label: t("settings.delete"),
                            danger: true,
                            onClick: () =>
                              useTrackersStore.getState().remove(tracker.id),
                            confirm: {
                              title: t("settings.deleteTitle"),
                              body: t("settings.deleteWarning"),
                              confirmLabel: t("settings.deleteConfirm"),
                            },
                          },
                        ]}
                      />
                    </Group>
                  </Group>
                </SortableItem>
              );
            })}
          </Stack>
        </SortableList>
      )}

      <Button
        variant="subtle"
        size="compact-sm"
        c="var(--sw-ink-3)"
        justify="flex-start"
        onClick={openAdd}
        style={{ fontWeight: 600, alignSelf: "flex-start" }}
      >
        + {t("settings.add")}
      </Button>

      <ResponsiveDialog
        opened={addOpened}
        onClose={addHandlers.close}
        title={t("settings.addTitle")}
      >
        <Stack gap="md">
          <TextInput
            autoFocus
            label={t("settings.name")}
            value={draft.name}
            maxLength={MAX_NAME}
            placeholder={t("settings.namePlaceholder")}
            onChange={(event) =>
              setDraft({ ...draft, name: event.currentTarget.value })
            }
            onKeyDown={addKey}
          />
          <Stack gap={4}>
            <Text fz="sm" fw={600} c="var(--sw-ink-2)">
              {t("settings.typeLabel")}
            </Text>
            <SegmentedControl
              fullWidth
              value={draft.type}
              onChange={(value) => {
                const next = TRACKER_TYPES.find((type) => type === value);
                if (next) setDraft({ ...draft, type: next });
              }}
              data={TRACKER_TYPES.map((type) => ({
                value: type,
                label: typeLabel(type),
              }))}
            />
          </Stack>
          <IconPicker
            value={draft.icon}
            onChange={(icon) => setDraft({ ...draft, icon })}
          />
          <TrackerColorPicker
            label={t("settings.colorLabel")}
            value={draft.color}
            onChange={(color) => setDraft({ ...draft, color })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={addHandlers.close}>
              {t("settings.cancel")}
            </Button>
            <Button onClick={submitAdd} disabled={draft.name.trim().length === 0}>
              {t("settings.save")}
            </Button>
          </Group>
        </Stack>
      </ResponsiveDialog>

      <ResponsiveDialog
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={t("settings.editTitle")}
      >
        <Stack gap="md">
          <TextInput
            autoFocus
            label={t("settings.name")}
            value={editDraft.name}
            maxLength={MAX_NAME}
            placeholder={t("settings.namePlaceholder")}
            onChange={(event) =>
              setEditDraft({ ...editDraft, name: event.currentTarget.value })
            }
            onKeyDown={editKey}
          />
          <IconPicker
            value={editDraft.icon}
            onChange={(icon) => setEditDraft({ ...editDraft, icon })}
          />
          <TrackerColorPicker
            label={t("settings.colorLabel")}
            value={editDraft.color}
            onChange={(color) => setEditDraft({ ...editDraft, color })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" c="var(--sw-ink-2)" onClick={() => setEditing(null)}>
              {t("settings.cancel")}
            </Button>
            <Button
              onClick={submitEdit}
              disabled={editDraft.name.trim().length === 0}
            >
              {t("settings.save")}
            </Button>
          </Group>
        </Stack>
      </ResponsiveDialog>
    </Stack>
  );
};
