import { Button, Drawer, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { isBuiltinList } from "../../../services/repos/listsRepo.ts";
import { moveTask } from "../../../services/repos/tasksRepo.ts";
import { orderForTop } from "../../../services/ordering.ts";
import { weekDays } from "../../../services/time.ts";
import { useAuthStore } from "../../../state/authStore.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";

export const MoveTaskMenu = () => {
  const { t } = useTranslation("tasks");
  const target = useUiStore((state) => state.moveTarget);
  const language = useSettingsStore((state) => state.language);
  const lists = useListsStore((state) => state.lists);
  const weekId = useWeekStore((state) => state.weekId);

  const days = weekId ? weekDays(weekId, language) : [];

  const moveToDay = (dayIso: number) => {
    const uid = useAuthStore.getState().uid;
    if (!uid || !weekId || !target) return;
    const dest = useWeekStore.getState().tasksByDay[dayIso] ?? [];
    moveTask(uid, target.id, {
      bucket: "day",
      weekId,
      day: dayIso,
      listId: null,
      order: orderForTop(dest),
    });
    useUiStore.getState().closeMove();
  };

  const moveToList = (listId: string) => {
    const uid = useAuthStore.getState().uid;
    if (!uid || !target) return;
    const dest = useListsStore.getState().tasksByList[listId] ?? [];
    moveTask(uid, target.id, {
      bucket: "list",
      weekId: null,
      day: null,
      listId,
      order: orderForTop(dest),
    });
    useUiStore.getState().closeMove();
  };

  return (
    <Drawer
      opened={target !== null}
      onClose={() => useUiStore.getState().closeMove()}
      position="bottom"
      size="auto"
      title={t("moveMenu.title")}
      styles={{
        content: { backgroundColor: "var(--sw-paper)" },
        header: { backgroundColor: "var(--sw-paper)" },
        title: {
          fontFamily: "var(--sw-font-hand)",
          fontSize: 24,
          color: "var(--sw-ink-2)",
        },
      }}
    >
      <Stack gap="lg" pb="md">
        <Stack gap="xs">
          <Text fz="sm" fw={700} c="var(--sw-ink-3)">
            {t("moveMenu.days")}
          </Text>
          <Group gap="xs">
            {days.map((day) => {
              const here =
                target?.bucket === "day" && target.day === day.iso;
              return (
                <Button
                  key={day.iso}
                  size="compact-sm"
                  variant={here ? "filled" : "light"}
                  disabled={here}
                  onClick={() => moveToDay(day.iso)}
                >
                  {day.label}
                </Button>
              );
            })}
          </Group>
        </Stack>
        <Stack gap="xs">
          <Text fz="sm" fw={700} c="var(--sw-ink-3)">
            {t("moveMenu.lists")}
          </Text>
          <Group gap="xs">
            {lists.map((list) => {
              const here =
                target?.bucket === "list" && target.listId === list.id;
              const name = isBuiltinList(list.id)
                ? t(`lists.${list.kind}`)
                : (list.name ?? "");
              return (
                <Button
                  key={list.id}
                  size="compact-sm"
                  variant={here ? "filled" : "light"}
                  disabled={here}
                  onClick={() => moveToList(list.id)}
                >
                  {name}
                </Button>
              );
            })}
          </Group>
        </Stack>
      </Stack>
    </Drawer>
  );
};
