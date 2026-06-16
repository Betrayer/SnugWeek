import { CloseButton } from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { Task } from "../../../services/repos/tasksRepo.ts";
import { rankNotes, rankTasks } from "../../../services/search/searchIndex.ts";
import type {
  NoteEntry,
  NoteHit,
} from "../../../services/search/searchIndex.ts";
import { loadRemoteCorpus } from "../../../services/search/searchCorpus.ts";
import {
  loadSearchRecents,
  pushSearchRecent,
} from "../../../services/search/searchRecents.ts";
import {
  currentMonthId,
  currentWeekId,
  parseDateInput,
  todayIsoDay,
  weekDays,
  weekTitle,
} from "../../../services/time.ts";
import type { ParsedDate } from "../../../services/time.ts";
import { useAuthStore } from "../../../state/authStore.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useProfileStore } from "../../../state/profileStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";

const MAX_TASKS = 6;
const MAX_NOTES = 4;

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </svg>
);

const TaskGlyph = ({ done }: { done: boolean }) => (
  <span
    style={{
      width: 18,
      height: 18,
      borderRadius: "50%",
      border: `2px solid ${done ? "var(--sw-done)" : "var(--sw-line)"}`,
      backgroundColor: done ? "var(--sw-done)" : "transparent",
      display: "inline-flex",
    }}
  />
);

const emptyCorpus = { tasks: [] as Task[], notes: [] as NoteEntry[] };

export const CommandSurface = () => {
  const { t } = useTranslation(["search", "common", "tasks"]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const reduced = useReducedMotionPref();
  const language = useSettingsStore((state) => state.language);
  const notesAllowed = useProfileStore(
    (state) => state.moduleToggles.weekNote,
  );
  const tasksByDay = useWeekStore((state) => state.tasksByDay);
  const week = useWeekStore((state) => state.week);
  const openWeekId = useWeekStore((state) => state.weekId);
  const tasksByList = useListsStore((state) => state.tasksByList);
  const lists = useListsStore((state) => state.lists);

  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const [remoteCorpus, setRemoteCorpus] = useState(emptyCorpus);
  const [openedAt, setOpenedAt] = useState(0);

  const handleOpen = useCallback(() => {
    setOpenedAt(Date.now());
    setRecents(loadSearchRecents());
    const uid = useAuthStore.getState().uid;
    if (!uid) return;
    void loadRemoteCorpus(uid)
      .then(setRemoteCorpus)
      .catch((error: unknown) => console.error(error));
  }, []);

  const corpus = useMemo(() => {
    const taskMap = new Map<string, Task>();
    for (const tasks of Object.values(tasksByList)) {
      for (const task of tasks) taskMap.set(task.id, task);
    }
    for (const tasks of Object.values(tasksByDay)) {
      for (const task of tasks) taskMap.set(task.id, task);
    }
    for (const task of remoteCorpus.tasks) {
      if (!taskMap.has(task.id)) taskMap.set(task.id, task);
    }

    const notes: NoteEntry[] = [];
    if (notesAllowed) {
      const seen = new Set<string>();
      const pushNote = (note: NoteEntry) => {
        const key = `${note.weekId}:${note.day ?? "w"}`;
        if (seen.has(key) || note.text.trim().length === 0) return;
        seen.add(key);
        notes.push(note);
      };
      if (openWeekId && week) {
        pushNote({ weekId: openWeekId, day: null, text: week.note });
        for (const [day, text] of Object.entries(week.dayNotes)) {
          pushNote({ weekId: openWeekId, day: Number(day), text });
        }
      }
      for (const note of remoteCorpus.notes) pushNote(note);
    }

    return { tasks: [...taskMap.values()], notes };
  }, [tasksByList, tasksByDay, remoteCorpus, week, openWeekId, notesAllowed]);

  const taskHits = useMemo(
    () => rankTasks(corpus.tasks, query, openedAt, MAX_TASKS),
    [corpus.tasks, query, openedAt],
  );
  const noteHits = useMemo(
    () => rankNotes(corpus.notes, query, MAX_NOTES),
    [corpus.notes, query],
  );

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;
  const parsedDate = useMemo(
    () => (hasQuery ? parseDateInput(trimmed, language) : null),
    [hasQuery, trimmed, language],
  );

  const routeTargets = useMemo(
    () => [
      { key: "week", label: t("common:nav.week"), to: `/w/${currentWeekId()}` },
      {
        key: "month",
        label: t("common:nav.month"),
        to: `/month/${currentMonthId()}`,
      },
      { key: "stats", label: t("common:nav.stats"), to: "/stats" },
      { key: "settings", label: t("common:nav.settings"), to: "/settings" },
    ],
    [t],
  );

  const matchedRoutes = useMemo(() => {
    if (!hasQuery) return [];
    const needle = trimmed.toLowerCase();
    return routeTargets.filter((route) =>
      route.label.toLowerCase().includes(needle),
    );
  }, [hasQuery, trimmed, routeTargets]);

  const remember = () => {
    if (trimmed.length > 0) setRecents(pushSearchRecent(trimmed));
  };

  const taskLocationLabel = (task: Task): string => {
    if (task.bucket === "day" && task.weekId && task.day !== null) {
      const day = weekDays(task.weekId, language).find(
        (item) => item.iso === task.day,
      );
      return day ? day.label : weekTitle(task.weekId);
    }
    const list = lists.find((item) => item.id === task.listId);
    if (!list) return "";
    return list.kind === "custom"
      ? (list.name ?? "")
      : t(`tasks:lists.${list.kind}`);
  };

  const focusTask = (task: Task) => {
    remember();
    const ui = useUiStore.getState();
    if (task.bucket === "day" && task.weekId) {
      if (task.day !== null) ui.setActiveMobileDay(task.day);
      ui.requestOpenTask(task.id, task.weekId);
      navigate(`/w/${task.weekId}`);
    } else {
      ui.openTask(task.id);
    }
  };

  const noteLabel = (hit: NoteHit): string => {
    if (hit.day !== null) {
      const day = weekDays(hit.weekId, language).find(
        (item) => item.iso === hit.day,
      );
      return day ? `${t("search:noteDay")} · ${day.label}` : t("search:noteDay");
    }
    return `${t("search:noteWeek")} · ${weekTitle(hit.weekId)}`;
  };

  const openNote = (hit: NoteHit) => {
    remember();
    if (hit.day !== null) useUiStore.getState().setActiveMobileDay(hit.day);
    navigate(`/w/${hit.weekId}`);
  };

  const dateLabel = (parsed: ParsedDate): string => {
    const day = weekDays(parsed.weekId, language).find(
      (item) => item.iso === parsed.isoDay,
    );
    return day ? day.label : parsed.dateKey;
  };

  const goToDate = (parsed: ParsedDate) => {
    remember();
    useUiStore.getState().setActiveMobileDay(parsed.isoDay);
    navigate(`/w/${parsed.weekId}`);
  };

  const goToToday = () => {
    useUiStore.getState().setActiveMobileDay(todayIsoDay());
    navigate(`/w/${currentWeekId()}`);
  };

  const goToRoute = (to: string) => {
    remember();
    navigate(to);
  };

  const quickAdd = () => {
    if (trimmed.length === 0) return;
    const store = useWeekStore.getState();
    const targetWeek = store.weekId;
    remember();
    if (!targetWeek) {
      navigate(`/w/${currentWeekId()}`);
      return;
    }
    const ui = useUiStore.getState();
    const defaultDay = targetWeek === currentWeekId() ? todayIsoDay() : 1;
    const day = isMobile ? (ui.activeMobileDay ?? defaultDay) : defaultDay;
    ui.setActiveMobileDay(day);
    navigate(`/w/${targetWeek}`);
    store.addTask(day, trimmed);
  };

  return (
    <Spotlight.Root
      query={query}
      onQueryChange={setQuery}
      onSpotlightOpen={handleOpen}
      fullScreen={isMobile}
      radius="lg"
      transitionProps={{
        transition: "pop",
        duration: reduced ? 0 : 200,
      }}
      styles={{
        content: { backgroundColor: "var(--sw-paper)" },
        header: { backgroundColor: "var(--sw-paper)" },
        search: {
          backgroundColor: "var(--sw-card)",
          color: "var(--sw-ink)",
          borderColor: "var(--sw-line)",
        },
      }}
    >
      <Spotlight.Search
        placeholder={t("search:placeholder")}
        leftSection={<SearchIcon />}
        rightSection={
          isMobile ? (
            <CloseButton
              aria-label={t("search:close")}
              onClick={() => spotlight.close()}
            />
          ) : undefined
        }
        rightSectionPointerEvents={isMobile ? "all" : undefined}
      />
      <Spotlight.ActionsList>
        {hasQuery ? (
          <>
            {taskHits.length > 0 && (
              <Spotlight.ActionsGroup label={t("search:groups.tasks")}>
                {taskHits.map((hit) => (
                  <Spotlight.Action
                    key={`task-${hit.task.id}`}
                    label={hit.task.title}
                    description={taskLocationLabel(hit.task)}
                    leftSection={<TaskGlyph done={hit.task.status === "done"} />}
                    onClick={() => focusTask(hit.task)}
                  />
                ))}
              </Spotlight.ActionsGroup>
            )}

            {noteHits.length > 0 && (
              <Spotlight.ActionsGroup label={t("search:groups.notes")}>
                {noteHits.map((hit) => (
                  <Spotlight.Action
                    key={`note-${hit.weekId}-${hit.day ?? "w"}`}
                    label={noteLabel(hit)}
                    description={hit.snippet}
                    leftSection={<span style={{ fontSize: 16 }}>📝</span>}
                    onClick={() => openNote(hit)}
                  />
                ))}
              </Spotlight.ActionsGroup>
            )}

            {(parsedDate || matchedRoutes.length > 0) && (
              <Spotlight.ActionsGroup label={t("search:groups.goto")}>
                {parsedDate && (
                  <Spotlight.Action
                    key="goto-date"
                    label={t("search:gotoDate", { date: dateLabel(parsedDate) })}
                    leftSection={<span style={{ fontSize: 16 }}>📅</span>}
                    onClick={() => goToDate(parsedDate)}
                  />
                )}
                {matchedRoutes.map((route) => (
                  <Spotlight.Action
                    key={`route-${route.key}`}
                    label={route.label}
                    description={t("search:openRoute")}
                    leftSection={<span style={{ fontSize: 16 }}>→</span>}
                    onClick={() => goToRoute(route.to)}
                  />
                ))}
              </Spotlight.ActionsGroup>
            )}

            <Spotlight.ActionsGroup label={t("search:groups.add")}>
              <Spotlight.Action
                key="quick-add"
                label={t("search:addAction", { query: trimmed })}
                leftSection={<span style={{ fontSize: 16 }}>➕</span>}
                onClick={quickAdd}
              />
            </Spotlight.ActionsGroup>
          </>
        ) : (
          <>
            {recents.length > 0 && (
              <Spotlight.ActionsGroup label={t("search:groups.recent")}>
                {recents.map((recent) => (
                  <Spotlight.Action
                    key={`recent-${recent}`}
                    label={recent}
                    leftSection={<span style={{ fontSize: 16 }}>🕘</span>}
                    closeSpotlightOnTrigger={false}
                    onClick={() => setQuery(recent)}
                  />
                ))}
              </Spotlight.ActionsGroup>
            )}
            <Spotlight.ActionsGroup label={t("search:groups.goto")}>
              <Spotlight.Action
                key="goto-today"
                label={t("search:goToday")}
                leftSection={<span style={{ fontSize: 16 }}>📅</span>}
                onClick={goToToday}
              />
              {routeTargets
                .filter((route) => route.key !== "week")
                .map((route) => (
                  <Spotlight.Action
                    key={`route-${route.key}`}
                    label={route.label}
                    leftSection={<span style={{ fontSize: 16 }}>→</span>}
                    onClick={() => goToRoute(route.to)}
                  />
                ))}
            </Spotlight.ActionsGroup>
          </>
        )}
      </Spotlight.ActionsList>
    </Spotlight.Root>
  );
};
