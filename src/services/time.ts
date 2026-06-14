import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import localeData from "dayjs/plugin/localeData.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/uk.js";
import "dayjs/locale/en.js";

dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

export type { Dayjs };

const WEEK_ID_PATTERN = /^\d{4}-W\d{2}$/;

const pad2 = (value: number): string => String(value).padStart(2, "0");

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const isoWeeksInYear = (year: number): number =>
  dayjs(`${year}-12-28`).isoWeek();

export const weekIdFromDate = (date: Date | Dayjs): string => {
  const d = dayjs(date);
  return `${d.isoWeekYear()}-W${pad2(d.isoWeek())}`;
};

export const currentWeekId = (): string => weekIdFromDate(dayjs());

export const isValidWeekId = (value: string): boolean => {
  if (!WEEK_ID_PATTERN.test(value)) return false;
  const week = Number(value.slice(6));
  return week >= 1 && week <= isoWeeksInYear(Number(value.slice(0, 4)));
};

export const mondayOf = (weekId: string): Dayjs => {
  const year = Number(weekId.slice(0, 4));
  const week = Number(weekId.slice(6));
  return dayjs(`${year}-01-04`)
    .startOf("isoWeek")
    .add(week - 1, "week");
};

export const addWeeks = (weekId: string, count: number): string =>
  weekIdFromDate(mondayOf(weekId).add(count, "week"));

export const daysOfWeek = (weekId: string): Dayjs[] => {
  const monday = mondayOf(weekId);
  return Array.from({ length: 7 }, (_, index) => monday.add(index, "day"));
};

export const monthIdOf = (date: Date | Dayjs): string =>
  dayjs(date).format("YYYY-MM");

export const currentMonthId = (): string => monthIdOf(dayjs());

export const weekTitle = (weekId: string): string =>
  `${capitalize(mondayOf(weekId).format("MMMM YYYY"))} · ${weekId.slice(5)}`;

const MONTH_ID_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const isValidMonthId = (value: string): boolean =>
  MONTH_ID_PATTERN.test(value);

export const monthTitle = (monthId: string): string =>
  capitalize(dayjs(`${monthId}-01`).format("MMMM YYYY"));

export const addMonths = (monthId: string, count: number): string =>
  dayjs(`${monthId}-01`).add(count, "month").format("YYYY-MM");

export const monthIdOfWeek = (weekId: string): string =>
  monthIdOf(mondayOf(weekId).add(3, "day"));

export const weekIdFromKey = (dateKey: string): string =>
  weekIdFromDate(dayjs(dateKey));

export const isoDayOfKey = (dateKey: string): number =>
  dayjs(dateKey).isoWeekday();

export const isoDateKey = (weekId: string, isoDay: number): string =>
  mondayOf(weekId)
    .add(isoDay - 1, "day")
    .format("YYYY-MM-DD");

export const todayIsoDay = (): number => dayjs().isoWeekday();

export const weeksOfMonth = (monthId: string): string[] => {
  const start = dayjs(`${monthId}-01`);
  const lastDay = start.endOf("month");
  const ids: string[] = [];
  let cursor = start.startOf("isoWeek");
  while (!cursor.isAfter(lastDay, "day")) {
    ids.push(weekIdFromDate(cursor));
    cursor = cursor.add(1, "week");
  }
  return ids;
};

export const isoDateKeyOf = (ms: number): string =>
  dayjs(ms).format("YYYY-MM-DD");

export const monthIdOfKey = (dateKey: string): string => dateKey.slice(0, 7);

export const currentYear = (): number => dayjs().year();

export const isValidYear = (value: string): boolean => /^\d{4}$/.test(value);

export const monthsOfYear = (year: number): string[] =>
  Array.from({ length: 12 }, (_, index) => `${year}-${pad2(index + 1)}`);

export const yearWeekRange = (year: number): { start: string; end: string } => ({
  start: weekIdFromDate(dayjs(`${year}-01-01`).startOf("isoWeek")),
  end: weekIdFromDate(dayjs(`${year}-12-31`).startOf("isoWeek")),
});

export const monthDayKeys = (monthId: string): string[] => {
  const count = dayjs(`${monthId}-01`).daysInMonth();
  return Array.from({ length: count }, (_, index) => `${monthId}-${pad2(index + 1)}`);
};

export const monthRangeMs = (monthId: string): { start: number; end: number } => {
  const base = dayjs(`${monthId}-01`);
  return {
    start: base.startOf("month").valueOf(),
    end: base.endOf("month").valueOf(),
  };
};

export const monthShortLabels = (locale: string): string[] =>
  Array.from({ length: 12 }, (_, index) =>
    capitalize(
      dayjs(`2020-${pad2(index + 1)}-01`).locale(locale).format("MMM"),
    ),
  );

export interface HeatmapCell {
  dateKey: string;
  date: number;
  inYear: boolean;
  isToday: boolean;
}

export interface HeatmapColumn {
  weekId: string;
  cells: HeatmapCell[];
  monthLabel: string | null;
}

export interface YearHeatmap {
  columns: HeatmapColumn[];
  firstWeekId: string;
  lastWeekId: string;
}

export const buildYearHeatmap = (year: number, locale: string): YearHeatmap => {
  const start = dayjs(`${year}-01-01`).startOf("isoWeek");
  const end = dayjs(`${year}-12-31`).endOf("isoWeek");
  const today = dayjs();
  const columns: HeatmapColumn[] = [];
  let cursor = start;
  while (!cursor.isAfter(end, "day")) {
    const cells: HeatmapCell[] = Array.from({ length: 7 }, (_, index) => {
      const day = cursor.add(index, "day");
      return {
        dateKey: day.format("YYYY-MM-DD"),
        date: day.date(),
        inYear: day.year() === year,
        isToday: day.isSame(today, "day"),
      };
    });
    const monthStart = cells.find((cell) => cell.inYear && cell.date === 1);
    const monthLabel = monthStart
      ? capitalize(dayjs(monthStart.dateKey).locale(locale).format("MMM"))
      : null;
    columns.push({ weekId: weekIdFromDate(cursor), cells, monthLabel });
    cursor = cursor.add(1, "week");
  }
  const firstWeekId = columns[0]?.weekId ?? weekIdFromDate(start);
  const lastColumn = columns[columns.length - 1];
  const lastWeekId = lastColumn ? lastColumn.weekId : weekIdFromDate(end);
  return { columns, firstWeekId, lastWeekId };
};

export const weekdayShortLabels = (locale: string): string[] => {
  const sunday = dayjs().day(0);
  return Array.from({ length: 7 }, (_, index) =>
    capitalize(sunday.add(index, "day").locale(locale).format("dd")),
  );
};

export const weekdayInitials = (locale: string): string[] => {
  const monday = dayjs().startOf("isoWeek");
  return Array.from({ length: 7 }, (_, index) =>
    capitalize(monday.add(index, "day").locale(locale).format("dd")).charAt(0),
  );
};

export interface MonthDayCellData {
  iso: number;
  date: number;
  dateKey: string;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface MonthWeekRow {
  weekId: string;
  weekNumber: string;
  days: MonthDayCellData[];
}

export const buildMonthGrid = (
  monthId: string,
  weekend: number[],
): MonthWeekRow[] => {
  const start = dayjs(`${monthId}-01`);
  const monthIndex = start.month();
  const lastDay = start.endOf("month");
  const today = dayjs();
  const rows: MonthWeekRow[] = [];
  let cursor = start.startOf("isoWeek");
  while (!cursor.isAfter(lastDay, "day")) {
    const weekId = weekIdFromDate(cursor);
    const days: MonthDayCellData[] = Array.from({ length: 7 }, (_, index) => {
      const day = cursor.add(index, "day");
      return {
        iso: day.isoWeekday(),
        date: day.date(),
        dateKey: day.format("YYYY-MM-DD"),
        inMonth: day.month() === monthIndex,
        isToday: day.isSame(today, "day"),
        isWeekend: weekend.includes(day.isoWeekday()),
      };
    });
    rows.push({ weekId, weekNumber: weekId.slice(5), days });
    cursor = cursor.add(1, "week");
  }
  return rows;
};

export const dayLabel = (day: Dayjs): string =>
  `${capitalize(day.format("dd"))} ${day.format("D.MM")}`;

export interface WeekDay {
  iso: number;
  label: string;
  initial: string;
  isToday: boolean;
}

export const weekDays = (weekId: string, locale: string): WeekDay[] => {
  const today = dayjs();
  return daysOfWeek(weekId).map((day) => {
    const localized = day.locale(locale);
    const short = capitalize(localized.format("dd"));
    return {
      iso: day.isoWeekday(),
      label: `${short} ${localized.format("D.MM")}`,
      initial: short.charAt(0),
      isToday: day.isSame(today, "day"),
    };
  });
};

export const setTimeLocale = (locale: string): void => {
  dayjs.locale(locale);
};
