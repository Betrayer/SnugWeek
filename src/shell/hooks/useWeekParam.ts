import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { addWeeks, currentWeekId, isValidWeekId } from "../../services/time.ts";

interface WeekParam {
  weekId: string;
  isCurrent: boolean;
  goTo: (weekId: string) => void;
  next: () => void;
  prev: () => void;
  today: () => void;
}

export const useWeekParam = (): WeekParam => {
  const params = useParams();
  const navigate = useNavigate();
  const raw = params.weekId;
  const weekId = raw && isValidWeekId(raw) ? raw : currentWeekId();

  const goTo = useCallback(
    (target: string) => {
      if (isValidWeekId(target)) navigate(`/w/${target}`);
    },
    [navigate],
  );
  const next = useCallback(() => goTo(addWeeks(weekId, 1)), [goTo, weekId]);
  const prev = useCallback(() => goTo(addWeeks(weekId, -1)), [goTo, weekId]);
  const today = useCallback(() => goTo(currentWeekId()), [goTo]);

  return { weekId, isCurrent: weekId === currentWeekId(), goTo, next, prev, today };
};
