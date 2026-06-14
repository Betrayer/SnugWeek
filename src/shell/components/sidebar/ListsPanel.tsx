import { useDroppable } from "@dnd-kit/core";
import { Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useListsStore } from "../../../state/listsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { HabitGrid } from "../habits/HabitGrid.tsx";
import { LIST_SIDEBAR_DROP_ID } from "../tasks/dndIds.ts";
import { AddListControl } from "./AddListControl.tsx";
import { ListSection } from "./ListSection.tsx";

const TASKS_LIST_ID = "tasks";
const IDEAS_LIST_ID = "ideas";

const SectionTitle = ({ children }: { children: string }) => (
  <Text ff="var(--sw-font-hand)" fz={28} fw={600} c="var(--sw-ink)" lh={1}>
    {children}
  </Text>
);

export const ListsPanel = () => {
  const { t } = useTranslation(["tasks", "habits"]);
  const lists = useListsStore((state) => state.lists);
  const showHabits = useProfileStore((state) => state.moduleToggles.habits);
  const { setNodeRef, isOver } = useDroppable({ id: LIST_SIDEBAR_DROP_ID });
  const tasksList = lists.find((list) => list.id === TASKS_LIST_ID);
  const ideasList = lists.find((list) => list.id === IDEAS_LIST_ID);
  const customLists = lists.filter(
    (list) => list.kind === "custom" && list.day === null,
  );

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <SectionTitle>{t("tasks:lists.tasks")}</SectionTitle>
        {tasksList && <ListSection list={tasksList} hideName />}
      </Stack>

      <Stack gap="xs">
        <SectionTitle>{t("tasks:lists.ideas")}</SectionTitle>
        {ideasList && <ListSection list={ideasList} hideName />}
      </Stack>

      <div
        ref={setNodeRef}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          backgroundColor: isOver
            ? "color-mix(in srgb, var(--sw-accent) 8%, transparent)"
            : "transparent",
          transition: "background-color 120ms ease",
        }}
      >
        <Stack gap="md">
          <SectionTitle>{t("tasks:lists.open")}</SectionTitle>
          {customLists.length === 0 ? (
            <Text ff="var(--sw-font-hand)" fz="lg" c="var(--sw-ink-3)">
              {t("tasks:lists.noLists")}
            </Text>
          ) : (
            customLists.map((list) => <ListSection key={list.id} list={list} />)
          )}
          <AddListControl />
        </Stack>
      </div>

      {showHabits && (
        <Stack gap="xs">
          <SectionTitle>{t("habits:title")}</SectionTitle>
          <HabitGrid />
        </Stack>
      )}
    </Stack>
  );
};
