import type { ReactNode } from "react";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { CurlTransitionHost } from "./CurlTransitionHost.tsx";
import { VariantTransitionHost } from "./VariantTransitionHost.tsx";
import { resolveTransition } from "./transitions.ts";

interface WeekTransitionHostProps {
  weekId: string;
  pageBackground: string;
  children: ReactNode;
}

export const WeekTransitionHost = ({
  weekId,
  pageBackground,
  children,
}: WeekTransitionHostProps) => {
  const setting = useSettingsStore((state) => state.transition);
  const reduced = useReducedMotionPref();
  const dragging = useUiStore((state) => state.dragging !== null);

  const transition = resolveTransition(setting, reduced || dragging);

  if (transition.kind === "curl") {
    return (
      <CurlTransitionHost weekId={weekId} pageBackground={pageBackground}>
        {children}
      </CurlTransitionHost>
    );
  }

  return (
    <VariantTransitionHost weekId={weekId} transition={transition}>
      {children}
    </VariantTransitionHost>
  );
};
