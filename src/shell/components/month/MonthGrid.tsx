import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { MonthWeekRow } from "../../../services/time.ts";
import type { DayCounts } from "../../../state/monthStore.ts";
import { MonthDayCell } from "./MonthDayCell.tsx";

interface MonthGridProps {
  rows: MonthWeekRow[];
  initials: string[];
  counts: Record<string, DayCounts>;
  moods: Record<string, string>;
  onOpenWeek: (weekId: string, iso?: number) => void;
}

interface RowProps {
  row: MonthWeekRow;
  counts: Record<string, DayCounts>;
  moods: Record<string, string>;
  onOpenWeek: (weekId: string, iso?: number) => void;
}

const Row = ({ row, counts, moods, onOpenWeek }: RowProps) => {
  const { t } = useTranslation("month");
  return (
    <>
      <UnstyledButton
        onClick={() => onOpenWeek(row.weekId)}
        aria-label={t("weekRow", { week: row.weekNumber })}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--mantine-font-size-xs)",
          fontWeight: 700,
          color: "var(--sw-ink-3)",
        }}
      >
        {row.weekNumber}
      </UnstyledButton>
      {row.days.map((day) => (
        <MonthDayCell
          key={day.dateKey}
          day={day}
          weekId={row.weekId}
          counts={counts[day.dateKey]}
          mood={moods[day.dateKey]}
          onOpen={onOpenWeek}
        />
      ))}
    </>
  );
};

export const MonthGrid = ({
  rows,
  initials,
  counts,
  moods,
  onOpenWeek,
}: MonthGridProps) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "minmax(2.4rem, auto) repeat(7, minmax(0, 1fr))",
      gap: 6,
      alignItems: "stretch",
    }}
  >
    <span />
    {initials.map((initial, index) => (
      <span
        key={index}
        style={{
          textAlign: "center",
          fontSize: "var(--mantine-font-size-xs)",
          fontWeight: 700,
          color: "var(--sw-ink-3)",
          paddingBottom: 2,
        }}
      >
        {initial}
      </span>
    ))}
    {rows.map((row) => (
      <Row
        key={row.weekId}
        row={row}
        counts={counts}
        moods={moods}
        onOpenWeek={onOpenWeek}
      />
    ))}
  </div>
);
