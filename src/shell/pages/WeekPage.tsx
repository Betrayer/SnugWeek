import { Stack } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { currentWeekId, isValidWeekId, weekDays } from "../../services/time.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { useWeekStore } from "../../state/weekStore.ts";
import { WeekNote } from "../components/note/WeekNote.tsx";
import { MobileDayPager } from "../components/week/MobileDayPager.tsx";
import { WeekBoard } from "../components/week/WeekBoard.tsx";
import { useIsMobile } from "../hooks/useIsMobile.ts";

export const WeekPage = () => {
  const params = useParams();
  const weekId =
    params.weekId && isValidWeekId(params.weekId)
      ? params.weekId
      : currentWeekId();
  const uid = useAuthStore((state) => state.uid);
  const language = useSettingsStore((state) => state.language);
  const week = useWeekStore((state) => state.week);
  const columnMode = useProfileStore((state) => state.columnMode);
  const weekend = useProfileStore((state) => state.weekend);
  const showNote = useProfileStore((state) => state.moduleToggles.weekNote);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (uid) useWeekStore.getState().open(uid, weekId);
  }, [uid, weekId]);

  const days = useMemo(() => weekDays(weekId, language), [weekId, language]);
  const daysOff = week?.daysOff ?? weekend;

  return (
    <Stack gap="lg">
      {isMobile ? (
        <MobileDayPager days={days} daysOff={daysOff} weekId={weekId} />
      ) : (
        <WeekBoard days={days} daysOff={daysOff} columnMode={columnMode} />
      )}
      {showNote && <WeekNote />}
    </Stack>
  );
};
