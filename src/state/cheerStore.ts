import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface CheerInstance {
  id: number;
  message: string;
  glyph: string;
  motion: boolean;
}

const CHEER_TTL_MS = 1700;
const MAX_CHEERS = 3;

let nextId = 0;

interface CheerState {
  cheers: CheerInstance[];
  push: (cheer: Omit<CheerInstance, "id">) => void;
}

export const useCheerStore = create<CheerState>()(
  devtools(
    (set) => ({
      cheers: [],
      push: (cheer) => {
        nextId += 1;
        const id = nextId;
        set((state) => ({
          cheers: [...state.cheers, { ...cheer, id }].slice(-MAX_CHEERS),
        }));
        window.setTimeout(() => {
          set((state) => ({
            cheers: state.cheers.filter((entry) => entry.id !== id),
          }));
        }, CHEER_TTL_MS);
      },
    }),
    { name: "cheerStore" },
  ),
);
