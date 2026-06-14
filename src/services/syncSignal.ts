import { flushPendingWrites } from "./firebase.ts";

type Listener = () => void;

let pending = false;
let token = 0;
const listeners = new Set<Listener>();

const emit = (): void => {
  for (const listener of listeners) listener();
};

const setPending = (next: boolean): void => {
  if (pending === next) return;
  pending = next;
  emit();
};

export const notePendingWrite = (): void => {
  setPending(true);
  const current = (token += 1);
  void flushPendingWrites()
    .then(() => {
      if (current === token) setPending(false);
    })
    .catch(() => {});
};

export const isPendingWrite = (): boolean => pending;

export const subscribePendingWrites = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
