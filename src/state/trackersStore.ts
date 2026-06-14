import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ORDER_SPACING, orderForBottom } from "../services/ordering.ts";
import {
  applyTrackerOrders,
  createTracker,
  deleteTracker,
  setTrackerEnabled,
  subscribeTrackers,
  updateTracker,
} from "../services/repos/trackersRepo.ts";
import type {
  NewTrackerFields,
  Tracker,
} from "../services/repos/trackersRepo.ts";

interface TrackersState {
  trackers: Tracker[];
  start: (uid: string) => void;
  stop: () => void;
  add: (fields: Omit<NewTrackerFields, "order">) => void;
  update: (id: string, fields: { name: string; icon: string }) => void;
  setEnabled: (id: string, enabled: boolean) => void;
  reorder: (orderedIds: string[]) => void;
  remove: (id: string) => void;
}

let unsubscribe: (() => void) | null = null;
let activeUid: string | null = null;

export const useTrackersStore = create<TrackersState>()(
  devtools(
    (set, get) => ({
      trackers: [],
      start: (uid) => {
        if (activeUid === uid && unsubscribe) return;
        if (unsubscribe) unsubscribe();
        activeUid = uid;
        set({ trackers: [] });
        unsubscribe = subscribeTrackers(uid, (trackers) => {
          set({ trackers });
        });
      },
      stop: () => {
        if (unsubscribe) unsubscribe();
        unsubscribe = null;
        activeUid = null;
        set({ trackers: [] });
      },
      add: (fields) => {
        const name = fields.name.trim();
        if (!activeUid || name.length === 0) return;
        createTracker(activeUid, {
          name,
          type: fields.type,
          icon: fields.icon,
          order: orderForBottom(get().trackers),
        });
      },
      update: (id, fields) => {
        const name = fields.name.trim();
        if (!activeUid || name.length === 0) return;
        updateTracker(activeUid, id, { name, icon: fields.icon });
      },
      setEnabled: (id, enabled) => {
        if (!activeUid) return;
        setTrackerEnabled(activeUid, id, enabled);
      },
      reorder: (orderedIds) => {
        if (!activeUid) return;
        applyTrackerOrders(
          activeUid,
          orderedIds.map((id, index) => ({ id, order: index * ORDER_SPACING })),
        );
      },
      remove: (id) => {
        if (!activeUid) return;
        deleteTracker(activeUid, id);
      },
    }),
    { name: "trackersStore" },
  ),
);
