import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface DraggingState {
  taskId: string;
}

interface UiState {
  sidebarOpened: boolean;
  dragging: DraggingState | null;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setDragging: (dragging: DraggingState | null) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    (set) => ({
      sidebarOpened: false,
      dragging: null,
      openSidebar: () => set({ sidebarOpened: true }),
      closeSidebar: () => set({ sidebarOpened: false }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpened: !state.sidebarOpened })),
      setDragging: (dragging) => set({ dragging }),
    }),
    { name: "uiStore" },
  ),
);
