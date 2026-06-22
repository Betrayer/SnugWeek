import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { DayCounts } from "../../../state/monthStore.ts";
import type { MonthDayCellData } from "../../../services/time.ts";
import { CheckGlyph } from "../icons/glyphs.tsx";

interface MonthDayCellProps {
  day: MonthDayCellData;
  weekId: string;
  counts: DayCounts | undefined;
  mood?: string;
  onOpen: (weekId: string, iso: number) => void;
}

export const MonthDayCell = ({
  day,
  weekId,
  counts,
  mood,
  onOpen,
}: MonthDayCellProps) => {
  const { t } = useTranslation("month");
  const open = counts?.open ?? 0;
  const done = counts?.done ?? 0;

  return (
    <UnstyledButton
      onClick={() => onOpen(weekId, day.iso)}
      aria-label={t("dayCell", { date: day.dateKey, open, done })}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 58,
        padding: "5px 6px",
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: day.isWeekend ? "var(--sw-paper-2)" : "var(--sw-card)",
        backgroundImage: "var(--sw-paper-texture)",
        border: day.isToday
          ? "2px solid var(--sw-accent)"
          : "1px solid var(--sw-line)",
        opacity: day.inMonth ? 1 : 0.4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1, minWidth: 0 }}>
          {mood ?? ""}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: day.isToday ? "var(--sw-accent-2)" : "var(--sw-ink-2)",
          }}
        >
          {day.date}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
          minHeight: 14,
        }}
      >
        {open > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--sw-ink-2)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--sw-accent)",
              }}
            />
            {open}
          </span>
        )}
        {done > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--sw-done)",
            }}
          >
            <CheckGlyph size={11} color="var(--sw-done)" />
            {done}
          </span>
        )}
      </div>
    </UnstyledButton>
  );
};
