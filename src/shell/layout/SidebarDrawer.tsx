import { DndContext } from "@dnd-kit/core";
import { Drawer } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../../state/uiStore.ts";
import { ListsPanel } from "../components/sidebar/ListsPanel.tsx";
import { TaskDragOverlay } from "../components/tasks/TaskDragOverlay.tsx";
import { useTaskDnd } from "../hooks/useTaskDnd.ts";

export const SidebarDrawer = () => {
  const { t } = useTranslation("tasks");
  const opened = useUiStore((state) => state.sidebarOpened);
  const close = useUiStore((state) => state.closeSidebar);
  const dnd = useTaskDnd();

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="right"
      size="85%"
      zIndex={150}
      title={t("lists.open")}
      styles={{
        content: {
          backgroundColor: "var(--sw-paper)",
          backgroundImage: "var(--sw-paper-texture)",
        },
        header: { backgroundColor: "var(--sw-paper)" },
        title: {
          fontFamily: "var(--sw-font-hand)",
          fontSize: 26,
          color: "var(--sw-ink-2)",
        },
      }}
    >
      <DndContext
        sensors={dnd.sensors}
        collisionDetection={dnd.collisionDetection}
        onDragStart={dnd.onDragStart}
        onDragEnd={dnd.onDragEnd}
        onDragCancel={dnd.onDragCancel}
      >
        <ListsPanel />
        <TaskDragOverlay task={dnd.activeTask} list={dnd.activeList} />
      </DndContext>
    </Drawer>
  );
};
