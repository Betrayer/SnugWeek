import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { CurlTransitionHost } from "./CurlTransitionHost.tsx";
import { VariantTransitionHost } from "./VariantTransitionHost.tsx";
import { resolveTransition } from "./transitions.ts";

interface WeekTransitionHostProps {
  weekId: string;
  children: ReactNode;
}

export const WeekTransitionHost = ({
  weekId,
  children,
}: WeekTransitionHostProps) => {
  const setting = useSettingsStore((state) => state.transition);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const dragging = useUiStore((state) => state.dragging !== null);
  const prefersReduced = useReducedMotion();

  const transition = resolveTransition(
    setting,
    reduceMotion || prefersReduced === true || dragging,
  );

  if (transition.kind === "curl") {
    return <CurlTransitionHost weekId={weekId}>{children}</CurlTransitionHost>;
  }

  return (
    <VariantTransitionHost weekId={weekId} transition={transition}>
      {children}
    </VariantTransitionHost>
  );
};
