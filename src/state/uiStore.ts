import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Task } from "../services/repos/tasksRepo.ts";

interface DraggingState {
  taskId: string;
}

interface UiState {
  sidebarOpened: boolean;
  dragging: DraggingState | null;
  moveTarget: Task | null;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setDragging: (dragging: DraggingState | null) => void;
  openMove: (task: Task) => void;
  closeMove: () => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    (set) => ({
      sidebarOpened: false,
      dragging: null,
      moveTarget: null,
      openSidebar: () => set({ sidebarOpened: true }),
      closeSidebar: () => set({ sidebarOpened: false }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpened: !state.sidebarOpened })),
      setDragging: (dragging) => set({ dragging }),
      openMove: (task) => set({ moveTarget: task }),
      closeMove: () => set({ moveTarget: null }),
    }),
    { name: "uiStore" },
  ),
);
