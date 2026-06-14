import { ActionIcon, Button, Group, Stack, Text } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import {
  addMonths,
  buildMonthGrid,
  currentMonthId,
  isValidMonthId,
  monthTitle,
  weekdayInitials,
} from "../../services/time.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useMonthStore } from "../../state/monthStore.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { MonthGrid } from "../components/month/MonthGrid.tsx";

const ChevronLeftIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const MonthPage = () => {
  const { t } = useTranslation(["month", "common"]);
  const params = useParams();
  const navigate = useNavigate();
  const uid = useAuthStore((state) => state.uid);
  const weekend = useProfileStore((state) => state.weekend);
  const language = useSettingsStore((state) => state.language);
  const countsByDate = useMonthStore((state) => state.countsByDate);

  const monthId =
    params.monthId && isValidMonthId(params.monthId)
      ? params.monthId
      : currentMonthId();
  const isCurrent = monthId === currentMonthId();

  useEffect(() => {
    if (uid) useMonthStore.getState().open(uid, monthId);
  }, [uid, monthId]);

  const rows = useMemo(() => buildMonthGrid(monthId, weekend), [monthId, weekend]);
  const initials = useMemo(() => weekdayInitials(language), [language]);
  const isEmpty = Object.keys(countsByDate).length === 0;

  const openWeek = (weekId: string, iso?: number) => {
    useUiStore.getState().setActiveMobileDay(iso ?? null);
    navigate(`/w/${weekId}`);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <Group gap={4} wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="var(--sw-ink-2)"
            aria-label={t("month:prevMonth")}
            onClick={() => navigate(`/month/${addMonths(monthId, -1)}`)}
          >
            <ChevronLeftIcon />
          </ActionIcon>
          <Text fw={700} fz="lg" c="var(--sw-ink)" style={{ minWidth: 0 }}>
            {monthTitle(monthId)}
          </Text>
          <ActionIcon
            variant="subtle"
            color="var(--sw-ink-2)"
            aria-label={t("month:nextMonth")}
            onClick={() => navigate(`/month/${addMonths(monthId, 1)}`)}
          >
            <ChevronRightIcon />
          </ActionIcon>
        </Group>
        {!isCurrent && (
          <Button
            variant="subtle"
            size="compact-sm"
            c="var(--sw-ink-2)"
            onClick={() => navigate(`/month/${currentMonthId()}`)}
          >
            {t("common:today")}
          </Button>
        )}
      </Group>
      <MonthGrid
        rows={rows}
        initials={initials}
        counts={countsByDate}
        onOpenWeek={openWeek}
      />
      {isEmpty && (
        <Text
          ff="var(--sw-font-hand)"
          fz="lg"
          c="var(--sw-ink-3)"
          ta="center"
          mt="sm"
        >
          {t("month:empty")}
        </Text>
      )}
    </Stack>
  );
};
