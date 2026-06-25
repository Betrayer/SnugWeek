import { Text } from "@mantine/core";
import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TAG_SWATCHES } from "../../../data/tagColors.ts";
import { buildMonthTracker } from "../../../services/month/monthTracker.ts";
import type {
  TrackerRow,
  TrackerSectionId,
} from "../../../services/month/monthTracker.ts";
import type { MonthTrackerDay } from "../../../services/time.ts";
import { weekIdFromKey } from "../../../services/time.ts";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { useMonthStore } from "../../../state/monthStore.ts";
import { useRoutinesStore } from "../../../state/routinesStore.ts";
import { EmptyState } from "../common/EmptyState.tsx";
import { LeafDoodle } from "../common/doodles.tsx";
import { TrackerIcon } from "../trackers/TrackerIcon.tsx";
import { MonthTrackerCell } from "./MonthTrackerCell.tsx";

interface MonthTrackerProps {
  monthId: string;
  days: MonthTrackerDay[];
  showHabits: boolean;
  onOpenWeek: (weekId: string, iso?: number) => void;
}

const nameCellStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  gap: 6,
  minWidth: 0,
  paddingInline: "8px 6px",
  borderBottom: "1px solid var(--sw-line)",
  borderInlineEnd: "1px solid var(--sw-line)",
  backgroundColor: "var(--sw-card)",
};

const headerHue = (iso: number): string =>
  TAG_SWATCHES[(iso - 1) % TAG_SWATCHES.length]?.value ?? "#d28aa0";

const RepeatGlyph = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M17 2.1 21 6l-4 3.9" />
    <path d="M3 12.5V11a5 5 0 0 1 5-5h13" />
    <path d="M7 21.9 3 18l4-3.9" />
    <path d="M21 11.5V13a5 5 0 0 1-5 5H3" />
  </svg>
);

const rowIcon = (sectionId: TrackerSectionId, icon: string | null): ReactNode => {
  if (sectionId === "routines") {
    return (
      <span style={{ color: "var(--sw-ink-3)", flex: "0 0 auto", display: "inline-flex" }}>
        <RepeatGlyph />
      </span>
    );
  }
  if (!icon) return null;
  if (sectionId === "habits") {
    return (
      <span style={{ flex: "0 0 auto", display: "inline-flex" }}>
        <TrackerIcon icon={icon} size={14} color="var(--sw-ink-3)" />
      </span>
    );
  }
  return (
    <span style={{ flex: "0 0 auto", fontSize: 13, lineHeight: 1 }}>{icon}</span>
  );
};

export const MonthTracker = ({
  monthId,
  days,
  showHabits,
  onOpenWeek,
}: MonthTrackerProps) => {
  const { t } = useTranslation("month");
  const habits = useHabitsStore((state) => state.habits);
  const routines = useRoutinesStore((state) => state.routines);
  const tasks = useMonthStore((state) => state.tasks);
  const habitChecksByDate = useMonthStore((state) => state.habitChecksByDate);

  const sections = useMemo(
    () =>
      buildMonthTracker({
        monthId,
        habits,
        routines,
        tasks,
        habitChecksByDate,
        showHabits,
      }),
    [monthId, habits, routines, tasks, habitChecksByDate, showHabits],
  );

  const templateColumns = `minmax(116px, 168px) repeat(${days.length}, 30px)`;

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={<LeafDoodle size={40} />}
        label={t("trackerEmpty")}
        minHeight={0}
      />
    );
  }

  const renderRow = (sectionId: TrackerSectionId, row: TrackerRow) => (
    <div key={row.id} style={{ display: "contents" }}>
      <div style={nameCellStyle}>
        <span
          aria-hidden
          style={{
            flex: "0 0 auto",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: row.color,
          }}
        />
        {rowIcon(sectionId, row.icon)}
        <Text fz="xs" fw={600} c="var(--sw-ink)" truncate title={row.label}>
          {row.label}
        </Text>
      </div>
      {days.map((day) => {
        const state = row.cells[day.dateKey];
        const stateKey = state ?? "empty";
        return (
          <MonthTrackerCell
            key={day.dateKey}
            state={state}
            color={row.color}
            isToday={day.isToday}
            isWeekend={day.isWeekend}
            label={t("trackerCellAria", {
              name: row.label,
              date: day.date,
              state: t(`trackerStates.${stateKey}`),
            })}
            onOpen={() => onOpenWeek(weekIdFromKey(day.dateKey), day.iso)}
          />
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        overflow: "auto",
        maxHeight: "calc(100dvh - 210px)",
        border: "1px solid var(--sw-line)",
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: "var(--sw-card)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: templateColumns }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 4,
            borderBottom: "1px solid var(--sw-line)",
            borderInlineEnd: "1px solid var(--sw-line)",
            backgroundColor: "var(--sw-card)",
          }}
        />
        {days.map((day) => (
          <div
            key={day.dateKey}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingBlock: 3,
              borderBottom: "1px solid var(--sw-line)",
              borderInlineEnd: "1px solid var(--sw-line)",
              backgroundColor: day.isToday
                ? "var(--sw-accent)"
                : `color-mix(in srgb, ${headerHue(day.iso)} 14%, var(--sw-card))`,
              color: day.isToday ? "var(--sw-accent-ink)" : "var(--sw-ink-2)",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>
              {day.date}
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.8 }}>
              {day.initial}
            </span>
          </div>
        ))}

        {sections.map((section) => (
          <div key={section.id} style={{ display: "contents" }}>
            <div
              style={{
                gridColumn: "1 / -1",
                position: "sticky",
                left: 0,
                borderBottom: "1px solid var(--sw-line)",
                backgroundColor: "var(--sw-paper-2)",
              }}
            >
              <Text
                fz={10}
                fw={700}
                tt="uppercase"
                c="var(--sw-ink-3)"
                style={{
                  position: "sticky",
                  left: 0,
                  display: "inline-block",
                  padding: "4px 8px",
                  letterSpacing: 0.4,
                }}
              >
                {t(`trackerSections.${section.id}`)}
              </Text>
            </div>
            {section.rows.map((row) => renderRow(section.id, row))}
          </div>
        ))}
      </div>
    </div>
  );
};
