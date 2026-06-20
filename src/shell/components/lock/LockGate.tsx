import type { ReactNode } from "react";
import { lockConfigured } from "../../../services/lock/lockService.ts";
import { useLockStore } from "../../../state/lockStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useIdleLock } from "../../hooks/useIdleLock.ts";
import { LockScreen } from "./LockScreen.tsx";

interface LockGateProps {
  children: ReactNode;
}

export const LockGate = ({ children }: LockGateProps) => {
  useIdleLock();
  const locked = useLockStore((state) => state.locked);
  const lockEnabled = useSettingsStore((state) => state.lockEnabled);
  const gated = lockEnabled && locked && lockConfigured();

  return (
    <>
      {children}
      {gated && <LockScreen />}
    </>
  );
};
