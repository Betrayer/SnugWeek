import { useCurrentWeekRecap } from "../../hooks/useCurrentWeekRecap.ts";
import { RecapCard } from "./RecapCard.tsx";

export const StatsRecapPanel = () => {
  const recap = useCurrentWeekRecap();
  if (!recap) return null;
  return <RecapCard recap={recap} />;
};
