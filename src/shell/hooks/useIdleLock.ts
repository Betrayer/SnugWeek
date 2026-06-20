import { useEffect } from "react";
import { lockConfigured } from "../../services/lock/lockService.ts";
import { useLockStore } from "../../state/lockStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";

const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
] as const;

const CHECK_INTERVAL_MS = 15000;

export const useIdleLock = (): void => {
  const lockEnabled = useSettingsStore((state) => state.lockEnabled);
  const lockAfterMin = useSettingsStore((state) => state.lockAfterMin);

  useEffect(() => {
    if (!lockEnabled) return;
    const limitMs = Math.max(1, lockAfterMin) * 60000;
    let lastActive = Date.now();
    let hiddenAt: number | null = null;

    const lockNow = () => {
      if (lockConfigured()) useLockStore.getState().lock();
    };
    const markActive = () => {
      lastActive = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      lastActive = Date.now();
      if (away >= limitMs) lockNow();
    };
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (useLockStore.getState().locked) return;
      if (Date.now() - lastActive >= limitMs) lockNow();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActive, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(tick, CHECK_INTERVAL_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActive);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, [lockEnabled, lockAfterMin]);
};
