import {
  ActionIcon,
  Button,
  Group,
  RingProgress,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_CUSTOM_MIN,
  clampDurationMin,
  clockToMinutes,
  formatRemaining,
  minutesToClock,
} from "../../../services/focus/focusTimer.ts";
import { TimeField } from "../common/TimeField.tsx";
import {
  currentWeekId,
  isoDateKey,
  isoDateKeyOf,
  weekIdFromKey,
} from "../../../services/time.ts";
import { useAuthStore } from "../../../state/authStore.ts";
import { useFocusStore } from "../../../state/focusStore.ts";
import { useRecapStore } from "../../../state/recapStore.ts";
import { CloseGlyph } from "../icons/glyphs.tsx";

const phaseColor = (phase: "focus" | "break"): string =>
  phase === "focus" ? "var(--sw-accent)" : "var(--sw-done)";

const useNow = (active: boolean): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
};

export const FocusTimer = () => {
  const { t } = useTranslation("focus");
  const uid = useAuthStore((state) => state.uid);
  const status = useFocusStore((state) => state.status);
  const phase = useFocusStore((state) => state.phase);
  const durationMs = useFocusStore((state) => state.durationMs);
  const endsAt = useFocusStore((state) => state.endsAt);
  const remainingMs = useFocusStore((state) => state.remainingMs);
  const taskId = useFocusStore((state) => state.taskId);
  const taskTitle = useFocusStore((state) => state.taskTitle);
  const sessions = useFocusStore((state) => state.sessions);
  const tasks = useRecapStore((state) => state.tasks);

  const [customMin, setCustomMin] = useState(DEFAULT_CUSTOM_MIN);
  const now = useNow(status === "running");

  useEffect(() => {
    if (uid) useRecapStore.getState().open(uid, currentWeekId());
  }, [uid]);

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks],
  );

  const todayCount = sessions[isoDateKeyOf(now)] ?? 0;
  const weekCount = useMemo(() => {
    const weekId = weekIdFromKey(isoDateKeyOf(now));
    let count = 0;
    for (let day = 1; day <= 7; day += 1) {
      count += sessions[isoDateKey(weekId, day)] ?? 0;
    }
    return count;
  }, [sessions, now]);

  const remaining =
    status === "running" && endsAt !== null
      ? Math.max(0, endsAt - now)
      : status === "paused"
        ? remainingMs
        : 0;
  const ratio = durationMs > 0 ? remaining / durationMs : 0;

  const isRunning = status === "running" || status === "paused";

  return (
    <Stack gap="lg" data-hint="focus">
      {taskId !== null ? (
        <Group gap="xs" wrap="nowrap" justify="center">
          <Text fz="sm" c="var(--sw-ink-2)" lineClamp={1}>
            {t("focusingOn", { title: taskTitle ?? "" })}
          </Text>
          <ActionIcon
            variant="subtle"
            color="var(--sw-ink-3)"
            aria-label={t("clearTask")}
            onClick={() => useFocusStore.getState().setTask(null, null)}
          >
            <CloseGlyph size={16} strokeWidth={1.8} />
          </ActionIcon>
        </Group>
      ) : (
        openTasks.length > 0 && (
          <Select
            placeholder={t("chooseTask")}
            data={openTasks.map((task) => ({
              value: task.id,
              label: task.title,
            }))}
            searchable
            clearable
            value={null}
            onChange={(value) => {
              const picked = openTasks.find((task) => task.id === value);
              if (picked) useFocusStore.getState().setTask(picked.id, picked.title);
            }}
            aria-label={t("chooseTask")}
            comboboxProps={{ withinPortal: false }}
          />
        )
      )}

      {isRunning && (
        <Stack gap="md" align="center">
          <div role="timer" aria-label={`${t(`phase.${phase}`)} ${formatRemaining(remaining)}`}>
            <RingProgress
              size={184}
              thickness={14}
              roundCaps
              sections={[{ value: ratio * 100, color: phaseColor(phase) }]}
              label={
                <Stack gap={0} align="center">
                  <Text
                    ff="var(--sw-font-hand)"
                    fz={48}
                    fw={700}
                    c="var(--sw-ink)"
                    lh={1}
                  >
                    {formatRemaining(remaining)}
                  </Text>
                  <Text fz="sm" c="var(--sw-ink-3)">
                    {t(`phase.${phase}`)}
                  </Text>
                </Stack>
              }
            />
          </div>
          <Group gap="sm" justify="center">
            {status === "running" ? (
              <Button
                variant="light"
                color="var(--sw-accent)"
                onClick={() => useFocusStore.getState().pause()}
              >
                {t("pause")}
              </Button>
            ) : (
              <Button
                color="var(--sw-accent)"
                onClick={() => useFocusStore.getState().resume()}
              >
                {t("resume")}
              </Button>
            )}
            <Button
              variant="subtle"
              color="var(--sw-ink-2)"
              onClick={() => useFocusStore.getState().reset()}
            >
              {t("reset")}
            </Button>
          </Group>
        </Stack>
      )}

      {status === "done" && (
        <Stack gap="md" align="center" style={{ textAlign: "center" }}>
          <Text ff="var(--sw-font-hand)" fz="xl" c="var(--sw-ink)">
            {phase === "focus" ? t("doneFocus") : t("doneBreak")}
          </Text>
          <Group gap="sm" justify="center">
            {phase === "focus" ? (
              <Button
                color="var(--sw-accent)"
                onClick={() => useFocusStore.getState().start(5, "break")}
              >
                {t("startBreak")}
              </Button>
            ) : (
              <Button
                color="var(--sw-accent)"
                onClick={() => useFocusStore.getState().start(25, "focus")}
              >
                {t("startFocus")}
              </Button>
            )}
            <Button
              variant="subtle"
              color="var(--sw-ink-2)"
              onClick={() => useFocusStore.getState().reset()}
            >
              {t("reset")}
            </Button>
          </Group>
        </Stack>
      )}

      {status === "idle" && (
        <Stack gap="md">
          <Group gap="sm" grow>
            <Button
              color="var(--sw-accent)"
              onClick={() => useFocusStore.getState().start(25, "focus")}
            >
              {t("presetFocus")}
            </Button>
            <Button
              variant="light"
              color="var(--sw-accent)"
              onClick={() => useFocusStore.getState().start(5, "break")}
            >
              {t("presetBreak")}
            </Button>
          </Group>
          <Group gap="sm" align="flex-end" wrap="nowrap">
            <TimeField
              label={t("customMinutes")}
              value={minutesToClock(customMin)}
              onChange={(value) =>
                setCustomMin(
                  value ? clampDurationMin(clockToMinutes(value)) : DEFAULT_CUSTOM_MIN,
                )
              }
              clearable={false}
              presets={["00:15", "00:25", "00:45", "01:00", "01:30"]}
              style={{ flex: 1 }}
            />
            <Button
              variant="subtle"
              color="var(--sw-accent)"
              onClick={() => useFocusStore.getState().start(customMin, "focus")}
            >
              {t("startCustom")}
            </Button>
          </Group>
        </Stack>
      )}

      <Text fz="xs" c="var(--sw-ink-3)" ta="center">
        {t("sessionsToday", { n: todayCount })} ·{" "}
        {t("sessionsWeek", { n: weekCount })}
      </Text>
    </Stack>
  );
};
