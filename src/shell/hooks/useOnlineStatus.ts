import { useSyncExternalStore } from "react";

const subscribeToNetwork = (onChange: () => void): (() => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

const isOnline = (): boolean => navigator.onLine;

export const useOnlineStatus = (): boolean =>
  useSyncExternalStore(subscribeToNetwork, isOnline);
