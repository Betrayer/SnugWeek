import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type DecorTarget = "week" | number;

interface DecorState {
  editMode: boolean;
  selectedId: string | null;
  paletteOpen: boolean;
  target: DecorTarget;
  enterEdit: () => void;
  exitEdit: () => void;
  toggleEdit: () => void;
  select: (id: string | null) => void;
  openPalette: (target?: DecorTarget) => void;
  closePalette: () => void;
  setTarget: (target: DecorTarget) => void;
}

export const useDecorStore = create<DecorState>()(
  devtools(
    (set) => ({
      editMode: false,
      selectedId: null,
      paletteOpen: false,
      target: "week",
      enterEdit: () => set({ editMode: true }),
      exitEdit: () =>
        set({ editMode: false, selectedId: null, paletteOpen: false }),
      toggleEdit: () =>
        set((state) =>
          state.editMode
            ? { editMode: false, selectedId: null, paletteOpen: false }
            : { editMode: true },
        ),
      select: (selectedId) => set({ selectedId }),
      openPalette: (target) =>
        set(target === undefined ? { paletteOpen: true } : { paletteOpen: true, target }),
      closePalette: () => set({ paletteOpen: false }),
      setTarget: (target) => set({ target }),
    }),
    { name: "decorStore" },
  ),
);
