import { useState } from "react";
import {
  dismissRecap,
  loadRecapDismissed,
} from "../../../services/recap/recapDismissed.ts";
import { useCurrentWeekRecap } from "../../hooks/useCurrentWeekRecap.ts";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { RecapCard } from "./RecapCard.tsx";

interface WeekRecapBannerProps {
  weekId: string;
}

export const WeekRecapBanner = ({ weekId }: WeekRecapBannerProps) => {
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(
    () => loadRecapDismissed() === weekId,
  );
  const recap = useCurrentWeekRecap();

  if (dismissed || !recap) return null;

  return (
    <div
      style={{
        position: "fixed",
        insetInlineEnd: 16,
        bottom: isMobile ? 84 : 16,
        zIndex: 190,
        width: "min(360px, calc(100vw - 32px))",
      }}
    >
      <RecapCard
        recap={recap}
        elevated
        onDismiss={() => {
          dismissRecap(weekId);
          setDismissed(true);
        }}
      />
    </div>
  );
};
